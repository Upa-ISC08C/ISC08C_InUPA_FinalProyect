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

  static async remove(id: string) {
    const ok = await companiesDAO.softDelete(id);
    if (!ok) throw new NotFoundError('Empresa no encontrada');
    return true;
  }
}