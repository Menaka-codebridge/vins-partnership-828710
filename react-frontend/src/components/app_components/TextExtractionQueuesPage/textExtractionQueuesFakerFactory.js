import { faker } from "@faker-js/faker";
export default (
  user,
  count,
  caseDocumentIdIds,
  documentStorageIdIds,
  caseNoIds,
) => {
  let data = [];
  for (let i = 0; i < count; i++) {
    const fake = {
      caseDocumentId: caseDocumentIdIds[i % caseDocumentIdIds.length],
      documentStorageId: documentStorageIdIds[i % documentStorageIdIds.length],
      documentType: faker.lorem.sentence(""),
      caseNo: caseNoIds[i % caseNoIds.length],

      updatedBy: user._id,
      createdBy: user._id,
    };
    data = [...data, fake];
  }
  return data;
};
