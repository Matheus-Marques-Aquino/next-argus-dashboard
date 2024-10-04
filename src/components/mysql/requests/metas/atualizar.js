//import MongoConnection from "@/components/dash-argus/MongoConnection";

export default async function updateMetas(body) {    
//    const { campanhas, metas } = body || {};
//
//    //console.log(body)
//
//    if (!campanhas || !metas) return { error: true, message: 'Campanha inválida!' };
//    const mongo = new MongoConnection();
//
//    var result = {};
//
//    try {
//        await mongo.connect();
//        const Campanhas = await mongo.getCollection("Campanhas", "Dashboard", true);        
//
//        for(let camp in metas) {
//            console.log('Camp:', camp, metas[camp]);
//
//            var campanha = campanhas.find((c) => c.sanitaze == camp);
//            if (!campanha) continue;
//
//            var _campanha = await Campanhas.findOne({ sanitaze: camp });        
//            const meta = metas[camp] || 0;
//
//            if (!_campanha) {
//                delete campanha.ready;
//                campanha.meta = parseInt(meta);
//                await Campanhas.insertOne(campanha);
//            } else {
//                await Campanhas.updateOne(
//                    { sanitaze: camp },
//                    { $set: { meta: parseInt(meta) } },
//                    { upsert: true }
//                );
//            }
//            
//            result[camp] = meta;
//        }
//
//        console.log('Update result:', result);
//    } catch(e) {
//        console.log('Erro ao atualizar meta argus:', e);
//        return { error: true, message: 'Erro ao atualizar meta.' };
//    } finally {
//        await mongo.disconnect();
//        console.log('Meta atualizada.');
//    }
//
//    return result;
}