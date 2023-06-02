import { cache } from 'react';
import { Animal } from '../migrations/1685696908-create-table-animals';
import { sql } from './connect';

export const getAnimals = cache(async () => {
  const animals = await sql<Animal[]>`
    SELECT * FROM animals
 `;
  return animals;
});

export const getAnimalById = cache(async (id: number) => {
  const [animal] = await sql<Animal[]>`
    SELECT
      *
    FROM
      animals
    WHERE
      id = ${id}
  `;
  return animal;
});

export const createAnimal = cache(
  async (firstName: string, type: string, accessory: string) => {
    const [animal] = await sql<Animal[]>`
      INSERT INTO animals
        (first_name, type, accessory)
      VALUES
        (${firstName}, ${type}, ${accessory})
      RETURNING *
    `;

    return animal;
  },
);

export const updateAnimalById = cache(
  async (id: number, firstName: string, type: string, accessory: string) => {
    const [animal] = await sql<Animal[]>`
      UPDATE animals
      SET
        first_name = ${firstName},
        type = ${type},
        accessory = ${accessory}
      WHERE
        id = ${id}
        RETURNING *
    `;

    return animal;
  },
);

export const deleteAnimalById = cache(async (id: number) => {
  const [animal] = await sql<Animal[]>`
    DELETE FROM
      animals
    WHERE
      id = ${id}
    RETURNING *
  `;
  return animal;
});

export const getAnimalByFirstName = cache(async (firstName: string) => {
  if (!firstName) {
    return undefined;
  }

  const [animal] = await sql<Animal[]>`
      SELECT
        *
      FROM
        animals
      WHERE
        first_name = ${firstName}
  `;
  return animal;
});
