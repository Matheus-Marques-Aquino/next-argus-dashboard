import MongoConnection from "@/components/dash-argus/MongoConnection";

export default async function updateMetas(req, res) {
    const mongo = new MongoConnection();

    var result = {};

    try {
        await mongo.connect();
        const Campanhas = await mongo.getCollection("Campanhas", "Dashboard", true);
        const campanhas = await Campanhas.find({ Ativo: 'ATIVO' }, { projection: { sanitaze: 1, meta: 1 }}).toArray();

        for(const camp in campanhas) {
            const { sanitaze, meta = 0 } = campanhas[camp];
            result[sanitaze] = meta;
        }

        console.log('Update result:', result);
    } catch(e) {
        console.log('Erro ao retornar meta argus:', e);
        return res.status(500).json({ error: true, message: 'Erro ao retornar meta.' });
    } finally {
        await mongo.disconnect();
        console.log('Meta atualizada.');
    }

    return res.status(200).json(result);
}