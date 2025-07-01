import { faker } from "@faker-js/faker";
export default (user, count, caseNoIds) => {
  let data = [];
  for (let i = 0; i < count; i++) {
    const fake = {
      caseNo: caseNoIds[i % caseNoIds.length],
      section: faker.lorem.sentence(1),
      subsection: faker.lorem.sentence(1),
      initialInference: faker.lorem.sentence(1),
      groundTruth: faker.lorem.sentence(1),
      promptUsed: faker.lorem.sentence(1),
      status: faker.lorem.sentence(1),

      updatedBy: user._id,
      createdBy: user._id,
    };
    data = [...data, fake];
  }
  return data;
};
