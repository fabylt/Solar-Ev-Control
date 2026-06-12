import {
  Auth,
  Connection,
  createConnection,
  getAuth,
  subscribeEntities,
  HassEntities,
} from "home-assistant-js-websocket";

export async function connectHA(callback: (entities: HassEntities) => void) {
  try {
    const auth = await getAuth({
      // We assume Ingress handles the proxying and auth when loaded
      // inside Home Assistant, so it might not need explicit login for ingress UI.
      // But typically home-assistant-js-websocket will load the auth info from the environment.
    });

    const connection = await createConnection({ auth });
    
    // Listen to all entities changes
    subscribeEntities(connection, (entities) => {
      callback(entities);
    });

    return connection;
  } catch (error) {
    console.error("Failed to connect to HA", error);
    throw error;
  }
}
