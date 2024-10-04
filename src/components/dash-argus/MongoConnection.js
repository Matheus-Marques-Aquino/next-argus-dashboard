const dotenv = require('dotenv');
const { MongoClient } = require('mongodb');

dotenv.config();

class MongoConnection {
    constructor() {
        this.connections = new Map();
        this.userId = this.generateUserId();
        this.database = 'Dashboard';       
        this.environment = process.env.ENVIRONMENT || 'SANDBOX'; 
    }
    
    generateUserId(){
        let userId = '';
        
        for (let i = 0; i < 5; i++) userId += Math.random(0).toString(36).slice(-10); 
        
        if (this.userId != userId) this.userId = userId.toUpperCase();

        return userId.toUpperCase();
    }
    
    async connect() {
        if (!this.userId) this.generateUserId();

        const client = new MongoClient(process.env.DATABASE_URL_2, {
            connectTimeoutMS: 3000000,
            socketTimeoutMS: 4500000,
            maxPoolSize: 45,
        });

        try {
            await client.connect();

            this.connections.set(this.userId, client);

            //console.log(`Conexão com o banco de dados aberta para o usuário ${this.userId}!`);
        } catch (error) {
            console.log(`Ocorreu um erro durante a conexão com o banco de dados para o usuário ${this.userId}!`, error);
        }

        return client;
    }
    
    async disconnect() {
        if (!this.userId) this.generateUserId();

        const client = this.connections.get(this.userId);

        if (client) {
            try {
                await client.close();

                this.connections.delete(this.userId);

                //console.log(`Conexão com o banco de dados fechada para o usuário ${this.userId}!`);
            } catch (error) {                
                console.log(`Ocorreu um erro ao fechar a conexão com o banco de dados para o usuário ${this.userId}!`, error);
            }
        }
    }
    
    getClient() {
        if (!this.userId) this.generateUserId();

        return this.connections.get(this.userId);
    }
    
    getConnectedUsers() {
        return Array.from(this.connections.keys());
    }
    
    async getDatabase(database) {
        if (!this.userId) this.generateUserId();

        const client = this.getClient();

        if (client && database) return client.db(database); 
        

        if (client) return client.db(this.database); 

        return null;
    }
    
    async getCollection(collectionName, database, force = false) {
        if (!this.userId) this.generateUserId();

        if (this.environment === 'SANDBOX' && !force) database = database + '-SandBox';
        
        const db = await this.getDatabase(database);

        if (db) {
            const collections = await db.listCollections({ name: collectionName }).toArray();
            
            if (collections.length > 0) return db.collection(collectionName);             

            const newCollection = await db.createCollection(collectionName, { capped: false });

            return newCollection;
        }

        return null;
    }

    async hasCollection(collectionName, database, force = false) {
        if (!this.userId) this.generateUserId();

        if (this.environment === 'SANDBOX' && !force) database = database + '-SandBox';

        const db = await this.getDatabase(database);
        const collections = await db.listCollections({ name: collectionName }).toArray();

        return collections.length > 0;
    }

    async dropCollection(collectionName, database, force = false) {
        if (!this.userId) this.generateUserId();

        if (this.environment === 'SANDBOX' && !force) database = database + '-SandBox';

        const collection = await this.getCollection(collectionName, database);
        const result = await collection.drop();

        return result;
    }

    async createCollection(collectionName, database, force = false) {
        if (!this.userId) this.generateUserId();

        if (this.environment === 'SANDBOX' && !force) database = database + '-SandBox';

        const db = await this.getDatabase(database);
        const collection = await db.createCollection(collectionName, { capped: false });

        return collection;
    }

    async renameCollection(collectionName, newName, database, force = false) {
        if (!this.userId) this.generateUserId();

        if (this.environment === 'SANDBOX' && !force) database = database + '-SandBox';

        const collection = await this.getCollection(collectionName, database);
        const result = await collection.rename(newName);

        return result;
    }

    async upsertDocuments(collectionName, database, filters, documents) {
        const collection = await this.getCollection(collectionName, database);
        var filter = {};

        filters.map((f, i) => {
            const { key, value } = f;
            skip = false;
            if (!key || !value) skip = true;
            if (!skip && (typeof key !== 'string')) skip = true;

            filter[f.key] = f.value
        }); 

        const operations = documents.map(doc => ({
            replaceOne: {
                filter: { ...filter }, // Filtro para localizar o documento existente
                replacement: doc, // Substitui completamente pelo novo documento
                upsert: true // Insere o documento se ele não existir
            }
        }));
    
        const result = await collection.bulkWrite(operations);
        console.log('Bulk operation completed:', result);
        return result;
    }
}

module.exports = MongoConnection;