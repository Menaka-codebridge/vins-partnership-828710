import { faker } from "@faker-js/faker";
export default (
  user,
  count,
  sectionContentIdIds,
  promptQueueIdIds,
  summonsNoIds,
) => {
  let data = [];
  for (let i = 0; i < count; i++) {
    const fake = {
      jobId: faker.lorem.sentence(""),
      sectionContentId: sectionContentIdIds[i % sectionContentIdIds.length],
      promptQueueId: promptQueueIdIds[i % promptQueueIdIds.length],
      summonsNo: summonsNoIds[i % summonsNoIds.length],
      section: faker.lorem.sentence(""),
      subsection: faker.lorem.sentence(""),
      inputTokens: faker.lorem.sentence(""),
      outputTokens: faker.lorem.sentence(""),
      totalTokens: faker.lorem.sentence(""),
      modelId: faker.lorem.sentence(""),

      updatedBy: user._id,
      createdBy: user._id,
    };
    data = [...data, fake];
  }
  return data;
};
