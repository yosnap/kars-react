// Script para inicializar el replica set de MongoDB
rs.initiate({
  _id: "rs0",
  members: [
    { _id: 0, host: "mongodb:27017" }
  ]
});

// Esperar a que el replica set esté listo
while (!rs.isMaster().ismaster) {
  sleep(100);
}

print("Replica set initialized successfully!");