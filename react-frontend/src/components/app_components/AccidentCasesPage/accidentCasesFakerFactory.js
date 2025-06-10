
import { faker } from "@faker-js/faker";
export default (user,count,userIds) => {
    let data = [];
    for (let i = 0; i < count; i++) {
        const fake = {
insuranceRef: faker.lorem.sentence(1),
caseNo: faker.lorem.sentence(1),
court: faker.lorem.sentence(1),
plaintiffSolicitors: faker.lorem.sentence(1),
plaintiff: faker.lorem.sentence(1),
insuredDriver: faker.lorem.sentence(1),
insured: faker.lorem.sentence(1),
insuredVehicle: faker.lorem.sentence(1),
collisionDateTime: faker.lorem.sentence(1),
claimStatus: faker.lorem.sentence(1),
user: userIds[i % userIds.length],
synonyms: faker.lorem.sentence(1),
parameters: faker.lorem.sentence(1),

updatedBy: user._id,
createdBy: user._id
        };
        data = [...data, fake];
    }
    return data;
};
