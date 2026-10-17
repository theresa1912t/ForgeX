// Stands in for our backend's data-collection service. Subscribes to every machine/metric topic
// and persists each reading via sensorReadingRepository — the same repository layer every other
// server-side write in this app goes through. Run alongside mqttSimulator.ts:
// npm run ingest:telemetry
import 'dotenv/config';
import mqtt from 'mqtt';
import * as sensorReadingRepository from '../lib/repositories/sensorReadingRepository';

const BROKER_URL = process.env.MQTT_BROKER_URL ?? 'mqtt://localhost:1883';
const TOPIC_PATTERN = 'forgex/machines/+/+';

// Nothing in the app ever reads more than the latest reading per machine/metric (see
// sensorReadingRepository's findLatest/findRecentByMachine callers) — everything older than this
// is pure overhead, never queried, just accumulating. Cleanup runs frequently relative to the
// retention window so storage stays close to 5 minutes, not up to 2x that between cycles.
const RETENTION_MS = 5 * 60 * 1000;
const CLEANUP_INTERVAL_MS = 60 * 1000;

const client = mqtt.connect(BROKER_URL);

client.on('connect', () => {
  console.log(`[ingestor] connected to ${BROKER_URL}, subscribing to ${TOPIC_PATTERN}`);
  client.subscribe(TOPIC_PATTERN);
});

async function cleanupOldReadings() {
  const cutoff = new Date(Date.now() - RETENTION_MS);
  const { count } = await sensorReadingRepository.deleteOlderThan(cutoff);
  if (count > 0) {
    console.log(`[ingestor] cleanup: removed ${count} reading(s) older than ${cutoff.toISOString()}`);
  }
}

setInterval(() => {
  cleanupOldReadings().catch((error) => console.error('[ingestor] cleanup failed:', error));
}, CLEANUP_INTERVAL_MS);

client.on('message', async (topic, payloadBuffer) => {
  const [, , machineId, metricKey] = topic.split('/');
  if (!machineId || !metricKey) {
    console.warn(`[ingestor] ignoring message on unexpected topic: ${topic}`);
    return;
  }

  try {
    const payload = JSON.parse(payloadBuffer.toString());
    await sensorReadingRepository.create({
      machineId,
      metricKey,
      value: Number(payload.value),
      unit: String(payload.unit),
    });
    console.log(`[ingestor] ${machineId}/${metricKey} = ${payload.value}${payload.unit}`);
  } catch (error) {
    console.error(`[ingestor] failed to process message on ${topic}:`, error);
  }
});

client.on('error', (error) => {
  console.error('[ingestor] MQTT error:', error);
});
