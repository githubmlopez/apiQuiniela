export function armaHeaderQuery(infToken, idProceso) {
    const header = {
        idProceso: idProceso,
        cveAplicacion: infToken.cveAplicacion,
        cveUsuario: infToken.cveUsuario,
        cveIdioma: infToken.cveIdioma,
        cvePerfil: infToken.cvePerfil
    };
    return header;
}
