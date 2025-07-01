import { faker } from "@faker-js/faker";
export default (user, count, companyIds, positionsIds) => {
  let data = [];
  for (let i = 0; i < count; i++) {
    const fake = {
      company: companyIds[i % companyIds.length],
      positions: positionsIds[i % positionsIds.length],
      mappingType: faker.lorem.sentence(""),

      updatedBy: user._id,
      createdBy: user._id,
    };
    data = [...data, fake];
  }
  return data;
};
