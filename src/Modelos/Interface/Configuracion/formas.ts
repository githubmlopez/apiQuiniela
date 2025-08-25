export function V_IN_PRUEBA(objeto: any): any {
	const errores: { error: string }[] = [];

	if (objeto.NUM_CLIENTE > 100) {
		errores.push({ error: 'Num Cliente > a 1000' });
	}

	if (objeto.NOMBRE_CLIENTE === 'SIN NOMBRE') {
		errores.push({
			error: 'El Nombre es incorrecto',
		});
	}

	if (objeto.IMP_SUELDO !== null && objeto.IMP_SUELDO > 1000) {
		errores.push({ error: 'El sueldo es incorrecto' });
	}

	if (objeto.IMP_SOBRE_SUELDO !== null && objeto.IMP_SOBRE_SUELDO > 1000) {
		errores.push({
			error:
				'Existe un error en el sobresueldo, el importe es mayor que 1000 pesos',
		});
	}

	if (objeto.F_INGRESO !== null && !(objeto.F_INGRESO instanceof Date)) {
		errores.push({
			error: 'La fecha es incorrecta',
		});
	}

	if (objeto.DESCRIPCION !== null && objeto.DESCRIPCION === 'SIN DESCRIPCION') {
		errores.push({ error: 'Must be a string or null.' });
	}

	if (objeto.B_ACTIVO !== null && typeof objeto.B_ACTIVO !== 'boolean') {
		errores.push({ error: 'Debe ser un valor valido' });
	}

	let errorAct: boolean = false;
	console.log(errores.length);
	if (errores.length == 0) {
		const randomNumber: number = Math.random();
		const threshold: number = 0.5;

		if (randomNumber < threshold) {
			errorAct = true;
		}
	}

	const resActError = {
		errores: errores,
		errorAct: errorAct,
	};

	return JSON.stringify(resActError);
}
