// Stands in for real OT hardware (the PLC/sensors on the covered machines) that doesn't exist in
// this demo. Publishes a small random walk around each tag's seeded baseline every 2s. Run
// alongside mqttIngestor.ts: npm run simulate:telemetry
import 'dotenv/config';
import mqtt from 'mqtt';
import { initialMachineProfiles } from '../lib/connectivityData';

const BROKER_URL = process.env.MQTT_BROKER_URL ?? 'mqtt://localhost:1883';
const PUBLISH_INTERVAL_MS = 2000;

// Only machines with both a real seeded Machine row AND a connectivity profile with tags
// qualify — mach-m01 is the other one besides mach-m03 (mach-m05 also qualifies but only has a
// single vibration tag). mach-m01's baseline vibration (1.8mm/s) stays well under the 3.0mm/s
// anomaly threshold, so it's expected to look "healthy" the whole time — a deliberate contrast
// to mach-m03, not a bug.
const MACHINE_IDS = ['mach-m03', 'mach-m01'];

const profiles = MACHINE_IDS.map((machineId) => {
  const profile = initialMachineProfiles[machineId];
  if (!profile) {
    throw new Error(`No connectivity profile found for ${machineId}`);
  }
  return profile;
});

const client = mqtt.connect(BROKER_URL);

client.on('connect', () => {
  console.log(`[simulator] connected to ${BROKER_URL}, publishing for ${MACHINE_IDS.join(', ')}`);

  setInterval(() => {
    for (const profile of profiles) {
      for (const tag of profile.tags) {
        const baseline = Number(tag.lastRawValue);
        const noise = baseline * 0.05 * (Math.random() * 2 - 1);
        const value = Math.round((baseline + noise) * 100) / 100;

        const topic = `forgex/machines/${profile.machineId}/${tag.metricKey}`;
        const payload = JSON.stringify({
          value,
          unit: tag.unit,
          timestamp: new Date().toISOString(),
        });

        client.publish(topic, payload);
      }
    }
  }, PUBLISH_INTERVAL_MS);
});

client.on('error', (error) => {
  console.error('[simulator] MQTT error:', error);
});
