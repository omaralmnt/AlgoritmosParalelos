export class Cliente {
  constructor(data = {}) {
    this.id = data.id || null;
    this.nombre = data.nombre || '';
    this.correo = data.correo || '';
    this.telefono = data.telefono || '';
    this.sexo = data.sexo || '';
    this.avatar = data.avatar || null;
  }

  toJSON() {
    return {
      nombre: this.nombre,
      correo: this.correo,
      telefono: this.telefono,
      sexo: this.sexo,
      avatar: this.avatar,
    };
  }
}
