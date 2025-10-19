export class Cliente {
  constructor(data = {}) {
    this.id = data.id || null;
    this.nombre = data.nombre || '';
    this.email = data.email || '';
    this.telefono = data.telefono || '';
    this.avatar_url = data.avatar_url || null;
    this.createdAt = data.createdAt || null;
    this.updatedAt = data.updatedAt || null;
  }

  toJSON() {
    return {
      nombre: this.nombre,
      email: this.email,
      telefono: this.telefono,
      avatar_url: this.avatar_url,
    };
  }
}
