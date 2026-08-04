import { companiesDAO } from '../../daos/companies.dao';
import { CreateCompanyDTO, UpdateCompanyDTO } from './companies.types';
import { NotFoundError, ValidationError } from '../../shared/errors';

export class CompaniesService {
  static async list() {
    return companiesDAO.getAll();
  }

  static async getById(id: string) {
    const empresa = await companiesDAO.getById(id);
    if (!empresa) throw new NotFoundError('Empresa no encontrada');
    return empresa;
  }

  static async create(data: CreateCompanyDTO) {
    if (!data.nombre || data.nombre.trim().length < 2) {
      throw new ValidationError('El nombre de la empresa es obligatorio');
    }
    if (!data.descripcion || data.descripcion.trim().length < 10) {
      throw new ValidationError('La descripción es obligatoria (mínimo 10 caracteres)');
    }
    if (!data.industria || data.industria.trim().length < 2) {
      throw new ValidationError('La industria es obligatoria');
    }
    if (!data.tamano || data.tamano.trim().length < 2) {
      throw new ValidationError('El tamaño de la empresa es obligatorio');
    }

    // Verificar nombre duplicado
    const existe = await companiesDAO.existsByName(data.nombre);
    if (existe) {
      throw new ValidationError('Ya existe una empresa registrada con este nombre');
    }

    return companiesDAO.create(data);
  }

  static async update(id: string, data: UpdateCompanyDTO) {
    if (data.nombre && data.nombre.trim().length < 2) {
      throw new ValidationError('El nombre de la empresa es obligatorio');
    }
    if (data.descripcion && data.descripcion.trim().length < 10) {
      throw new ValidationError('La descripción es obligatoria (mínimo 10 caracteres)');
    }
    if (data.industria && data.industria.trim().length < 2) {
      throw new ValidationError('La industria es obligatoria');
    }
    if (data.tamano && data.tamano.trim().length < 2) {
      throw new ValidationError('El tamaño de la empresa es obligatorio');
    }

    // Verificar nombre duplicado (excluyendo la empresa actual que se está editando)
    if (data.nombre) {
      const existe = await companiesDAO.existsByName(data.nombre, id);
      if (existe) {
        throw new ValidationError('Ya existe otra empresa registrada con este nombre');
      }
    }

    const actualizada = await companiesDAO.update(id, data);
    if (!actualizada) throw new NotFoundError('Empresa no encontrada');
    return actualizada;
  }

  /**
   * El botón de "Eliminar permanentemente" del admin debía borrar de verdad,
   * pero llamaba a softDelete: la empresa sólo se desactivaba (y sus vacantes
   * seguían existiendo) sin avisar que no fue un borrado real.
   */
  static async remove(id: string) {
    const empresa = await companiesDAO.getById(id);
    if (!empresa) throw new NotFoundError('Empresa no encontrada');

    try {
      await companiesDAO.hardDelete(id);
    } catch (error: any) {
      if (error.message && error.message.includes('No se puede eliminar')) {
        throw new ValidationError(error.message);
      }
      throw error;
    }
    return true;
  }
}