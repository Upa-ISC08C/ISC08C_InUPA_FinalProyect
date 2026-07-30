import { carrerasDAO } from '../../daos/carreras.dao';
import { ValidationError, NotFoundError } from '../../shared/errors';

export class CarrerasService {
  static async getAll() {
    return carrerasDAO.getAll();
  }

  static async getById(id: string) {
    const carrera = await carrerasDAO.getById(id);
    if (!carrera) throw new NotFoundError('Carrera no encontrada');
    return carrera;
  }

  static async create(nombre: string) {
    if (!nombre || nombre.trim().length < 3) {
      throw new ValidationError('El nombre de la carrera debe tener al menos 3 caracteres');
    }
    const existe = await carrerasDAO.existsByName(nombre);
    if (existe) throw new ValidationError('Ya existe una carrera con ese nombre');
    return carrerasDAO.create(nombre);
  }

  static async update(id: string, nombre: string) {
    if (!nombre || nombre.trim().length < 3) {
      throw new ValidationError('El nombre de la carrera debe tener al menos 3 caracteres');
    }
    const existe = await carrerasDAO.existsByName(nombre, id);
    if (existe) throw new ValidationError('Ya existe una carrera con ese nombre');
    
    const carrera = await carrerasDAO.update(id, nombre);
    if (!carrera) throw new NotFoundError('Carrera no encontrada');
    return carrera;
  }

  static async delete(id: string) {
    const carrera = await carrerasDAO.delete(id);
    if (!carrera) throw new NotFoundError('Carrera no encontrada');
    return true;
  }
}