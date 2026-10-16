// Stands in for real OT hardware (the PLC/sensors on mach-m03) that doesn't exist in this demo.
// Publishes a small random walk around each tag's seeded baseline every 2s. Run alongside
// mqttIngestor.ts: npm run simulate:telemetry
import 'dotenv/config';
import mqtt from 'mqtt';
import { initialMachineProfiles } from '../lib/connectivityData';

const BROKER_URL = process.env.MQTT_BROKER_URL ?? 'mqtt://localhost:1883';
const PUBLISH_INTERVAL_MS = 2000;
const MACHINE_ID = 'mach-m03';

const profile = initialMachineProfiles[MACHINE_ID];
if (!profile) {
  throw new Error(`No connectivity profile found for ${MACHINE_ID}`);
}

const client = mqtt.connect(BROKER_URL);

client.on('connect', () => {
  console.log(`[simulator] connected to ${BROKER_URL}, publishing for ${MACHINE_ID}`);

  setInterval(() => {
    for (const tag of profile.tags) {
      const baseline = Number(tag.lastRawValue);
      const noise = baseline * 0.05 * (Math.random() * 2 - 1);
      const value = Math.round((baseline + noise) * 100) / 100;

      const topic = `forgex/machines/${MACHINE_ID}/${tag.metricKey}`;
      const payload = JSON.stringify({ value, unit: tag.unit, timestamp: new Date().toISOString() });

      client.publish(topic, payload);
    }
  }, PUBLISH_INTERVAL_MS);
});

client.on('error', (error) => {
  console.error('[simulator] MQTT error:', error);
});
