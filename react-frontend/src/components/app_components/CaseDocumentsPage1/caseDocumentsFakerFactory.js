import { faker } from "@faker-js/faker";
export default (user, count, caseNoIds) => {
  let data = [];
  for (let i = 0; i < count; i++) {
    const fake = {
      caseNo: caseNoIds[i % caseNoIds.length],
      user: faker.lorem.sentence(1),
      fileName: faker.lorem.sentence(1),
      fileType: faker.lorem.sentence(1),
      storagePath: faker.lorem.sentence(1),
      extractedContent: faker.lorem.sentence(1),
      uploadTimestamp: faker.lorem.sentence(1),

      updatedBy: user._id,
      createdBy: user._id,
    };
    data = [...data, fake];
  }
  return data;
};
