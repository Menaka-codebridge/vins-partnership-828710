
import { faker } from "@faker-js/faker";
export default (user,count,caseNoIds) => {
    let data = [];
    for (let i = 0; i < count; i++) {
        const fake = {
caseNo: caseNoIds[i % caseNoIds.length],
extractedContent: faker.lorem.sentence(""),
uploadTimestamp: faker.lorem.sentence(""),
uploadedDocument: faker.lorem.sentence(""),

updatedBy: user._id,
createdBy: user._id
        };
        data = [...data, fake];
    }
    return data;
};
