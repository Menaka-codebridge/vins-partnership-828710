import { faker } from "@faker-js/faker";
export default (user, count, caseDocumentIdIds, caseNoIds) => {
  let data = [];
  for (let i = 0; i < count; i++) {
    const fake = {
      caseDocumentId: caseDocumentIdIds[i % caseDocumentIdIds.length],
      caseNo: caseNoIds[i % caseNoIds.length],
      status: faker.lorem.sentence(""),
      errorMessage: faker.lorem.sentence(""),

      updatedBy: user._id,
      createdBy: user._id,
    };
    data = [...data, fake];
  }
  return data;
};
