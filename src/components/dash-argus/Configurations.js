
function sanitazeName(name, removeDash = false) {
    if (typeof name !== 'string') return '';
    if (removeDash) name = name.replace(/-/g, '').replace(/\(/g, '').replace(/\)/g, '');
    return name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s/g, '_').toUpperCase();
}

function getPercentage(value, total) {
    return ((value / total) * 100).toFixed(2) + "%";
}

function toTwoDigits (value) {
    if (!/^\d+$/.test(value)) return value;
    return value.toString().padStart(2, '0');
}

const MongoConnection = require('./MongoConnection');

class Configurations {
    constructor() {
        this.configs = { starting: true };
        this.calendar = [];
    }    

    async load() {
        const mongo = new MongoConnection();
        await mongo.connect();

        try{
            const Configurations = await mongo.getCollection('Configurations', 'Dashboard', true);
            this.configs = await Configurations.findOne({});
            this.configs = { ...this.configs, starting: false, loading_data: false };

            console.log('Configurações carregadas com sucesso!');
        }catch(error){
            console.log('Erro ao buscar as configurações:', error);
        }finally{
            await mongo.disconnect();
        }
    }

    get(key) {
        return this.configs[key];
    }

    async set(key, value) {
        const mongo = new MongoConnection();
        await mongo.connect();

        try {
            this.configs[key] = value;

            const Configurations = await mongo.getCollection('Configurations', 'Dashboard', true);
            var _configs = await Configurations.findOne({});
    
            await Configurations.updateOne({ _id: _configs._id }, { $set: { [key]: value } });
        }catch(e){
            console.log('Erro setting configurations.', e)
        }finally{
            await mongo.disconnect()
        }
    }
}

const configurations = new Configurations();
module.exports = configurations;