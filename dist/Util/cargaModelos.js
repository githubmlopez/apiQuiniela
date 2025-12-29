import { def_FC_TAREA_EVENTO, def_Q_PARTIDO, def_Q_SURVIVOR } from '../index.js';
import { def_Q_QUINIELA } from '../index.js';
import { def_FC_FOLIO } from '../index.js';
import { def_FC_SEG_USUARIO, def_Q_QUIN_PARTICIPANTE } from '../index.js';
import { getInstancia } from '../index.js';
import { def_Q_USUARIO } from '../index.js';
import { def_IN_PRUEBA } from '../index.js';
import { def_FC_SEG_PASS_RESET } from '../index.js';
export async function cargaModelos() {
    const sequelize = await getInstancia();
    await def_FC_TAREA_EVENTO(sequelize);
    await def_Q_QUINIELA(sequelize);
    await def_FC_FOLIO(sequelize);
    await def_FC_SEG_USUARIO(sequelize);
    await def_Q_QUIN_PARTICIPANTE(sequelize);
    await def_Q_USUARIO(sequelize);
    await def_Q_SURVIVOR(sequelize);
    await def_Q_PARTIDO(sequelize);
    await def_IN_PRUEBA(sequelize);
    await def_FC_SEG_PASS_RESET(sequelize);
}
