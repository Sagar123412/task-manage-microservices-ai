import mongoose from "mongoose";

let connected = false;
let connecting: Promise<typeof mongoose> | null = null;

export async function connectMongo(uri: string): Promise<void> {
  if (connected) return;
  if (!connecting) {
    connecting = mongoose.connect(uri);
  }
  await connecting;
  connected = true;
}
