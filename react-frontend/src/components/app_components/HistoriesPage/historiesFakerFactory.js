import { faker } from "@faker-js/faker";
export default (user, count, caseNoIds, usersIds) => {
  let data = [];
  for (let i = 0; i < count; i++) {
    const fake = {
      caseNo: caseNoIds[i % caseNoIds.length],
      users: usersIds[i % usersIds.length],
      timestamp: faker.lorem.sentence(""),
      userPrompt: faker.lorem.sentence(""),
      parametersUsed: faker.lorem.sentence(""),
      synonymsUsed: faker.lorem.sentence(""),
      responseReceived: faker.lorem.sentence(""),
      section: faker.lorem.sentence(""),
      subSection: faker.lorem.sentence(""),

      updatedBy: user._id,
      createdBy: user._id,
    };
    data = [...data, fake];
  }
  return data;
};
