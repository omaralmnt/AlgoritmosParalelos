export class Usuario {
  constructor(data = {}) {
    this.id = data.id || null;
    this.nombreusuario = data.nombreusuario || '';
    this.nombre = data.nombre || '';
    this.correo = data.correo || '';
    this.telefono = data.telefono || '';
    this.fechaNacimiento = data.fechaNacimiento || null;
    this.avatar = data.avatar || null;
  }
}
