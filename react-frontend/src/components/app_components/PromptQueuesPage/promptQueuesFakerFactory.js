
import { faker } from "@faker-js/faker";
export default (user,count,sectionContentIdIds,summonsNoIds) => {
    let data = [];
    for (let i = 0; i < count; i++) {
        const fake = {
sectionContentId: sectionContentIdIds[i % sectionContentIdIds.length],
summonsNo: summonsNoIds[i % summonsNoIds.length],
promptUsed: faker.lorem.sentence(""),
status: faker.lorem.sentence(""),
errorMessage: faker.lorem.sentence(""),

updatedBy: user._id,
createdBy: user._id
        };
        data = [...data, fake];
    }
    return data;
};
