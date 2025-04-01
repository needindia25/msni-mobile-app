import { TFunction } from "i18next";

export const getStaticData = (t: TFunction) => ({
    propertyForOptions: [
        { label: t("rent"), value: "Rent" },
        { label: t("lease"), value: "Lease" }
    ],
    propertyTypeOptions: {
        "Lease": [
            { label: t("fullHouse"), value: "Full House" },
            { label: t("commercial"), value: "Commercial" },
        ],
        "Rent": [
            { label: t("fullHouse"), value: "Full House" },
            { label: t("pgHostel"), value: "PG/Hostel" },
            { label: t("commercial"), value: "Commercial" },
        ],
    },
    roomTypeOptions: [
        { label: t("single"), value: "Single" },
        { label: t("sharing2Beds"), value: "Sharing 2 Beds" },
        { label: t("sharing3Beds"), value: "Sharing 3 Beds" },
        { label: t("sharing4Beds"), value: "Sharing 4 Beds" },
    ],
    genderPreferenceOptions: [
        { label: t("male"), value: "Male" },
        { label: t("female"), value: "Female" },
        { label: t("any"), value: "Any" },
    ],
    foodPreferenceOptions: [
        { label: t("veg"), value: "Veg" },
        { label: t("nonVeg"), value: "Non-Veg" },
        { label: t("any"), value: "Any" },
    ],
    commercialTypeOptions: [
        { label: t("officeSpace"), value: "Office Space" },
        { label: t("coWorking"), value: "Co-Working" },
        { label: t("shop"), value: "Shop" },
        { label: t("showroom"), value: "Showroom" },
        { label: t("godown"), value: "Godown" },
        { label: t("warehouse"), value: "Warehouse" },
        { label: t("industrialShed"), value: "Industrial Shed" },
        { label: t("industrialBuilding"), value: "Industrial Building" },
        { label: t("restaurantCafe"), value: "Restaurant / Cafe" },
        { label: t("others"), value: "Others" },
    ],
    furnishingOptions: [
        { label: t("full"), value: "Full" },
        { label: t("semi"), value: "Semi" },
        { label: t("none"), value: "None" },
    ],
    parkingOptions: [
        { label: t("twoWheeler"), value: "2 Wheeler" },
        { label: t("fourWheeler"), value: "4 Wheeler" },
        { label: t("bothWheeler"), value: "2 and 4 Wheeler" },
        { label: t("none"), value: "None" },
    ],
    basicAmenitiesOptions: [
        { label: t("lift"), value: "Lift" },
        { label: t("powerBackup"), value: "Power backup" },
        { label: t("swimmingPool"), value: "Swimming Pool" },
        { label: t("playArea"), value: "Play Area" },
        { label: t("security"), value: "Security" },
    ],
    additionalAmenitiesOptions: [
        { label: t("washingMachine"), value: "Washing Machine" },
        { label: t("fridge"), value: "Fridge" },
        { label: t("ac"), value: "AC" },
        { label: t("cooler"), value: "Cooler" },
        { label: t("sofa"), value: "Sofa" },
        { label: t("internet"), value: "Internet" },
        { label: t("light"), value: "Light" },
        { label: t("fan"), value: "Fan" },
        { label: t("roWater"), value: "RO Water" },
        { label: t("bed"), value: "Bed" },
        { label: t("diningTable"), value: "Dining table" },
    ],
    sourceOfWaterOptions: [
        { label: t("supplyWater"), value: "Supply Water" },
        { label: t("borewell"), value: "Borewell" },
        { label: t("bothWater"), value: "Both" },
        { label: t("other"), value: "Other" },
    ],
    floors: [
        { label: "Ground Floor", value: 0 },
        { label: "1st Floor", value: 1 },
        { label: "2nd Floor", value: 2 },
        { label: "3rd Floor", value: 3 },
        { label: "4th Floor", value: 4 },
        { label: "5th Floor", value: 5 },
        { label: "6th Floor", value: 6 },
        { label: "7th Floor", value: 7 },
        { label: "8th Floor", value: 8 },
        { label: "9th Floor", value: 9 },
        { label: "10th Floor", value: 10 },
        { label: "11th Floor", value: 11 },
        { label: "12th Floor", value: 12 },
        { label: "13th Floor", value: 13 },
        { label: "14th Floor", value: 14 },
        { label: "15th Floor", value: 15 },
        { label: "16th Floor", value: 16 },
        { label: "17th Floor", value: 17 },
        { label: "18th Floor", value: 18 },
        { label: "19th Floor", value: 19 },
        { label: "20th Floor", value: 20 },
    ],
    bedRooms: [
        { label: "1", value: 1 },
        { label: "2", value: 2 },
        { label: "3", value: 3 },
        { label: "4+", value: 4 },
    ],
    balconies: [
        { label: "0", value: 0 },
        { label: "1", value: 1 },
        { label: "2", value: 2 },
        { label: "3", value: 3 },
        { label: "4+", value: 4 },
    ],
    bathRooms: [
        { label: "1", value: 1 },
        { label: "2", value: 2 },
        { label: "3", value: 3 },
        { label: "4", value: 4 },
    ],
    ageOfProperty: [
        { label: "New", value: 0 },
        { label: "1", value: 1 },
        { label: "2", value: 2 },
        { label: "3", value: 3 },
        { label: "4", value: 4 },
        { label: "5", value: 5 },
        { label: "6", value: 6 },
        { label: "7", value: 7 },
        { label: "8", value: 8 },
        { label: "9", value: 9 },
        { label: "10+", value: 10 },
    ],
    housingTypeOptions: [
        { label: t("apartment"), value: "Apartment" },
        { label: t("gatedCommunityVilla"), value: "Gated Community Villa" },
        { label: t("independentHouseVilla"), value: "Independent House/Villa" },
    ],
    bhkTypeOptions: [
        { label: t("1rhk"), value: "1 RHK" },
        { label: t("1bhk"), value: "1 BHK" },
        { label: t("2bhk"), value: "2 BHK" },
        { label: t("3bhk"), value: "3 BHK" },
        { label: t("4bhk"), value: "4 BHK" },
        { label: t("4plusbhk"), value: "4+ BHK" },
    ],
    familyPreferenceOptions: [
        { label: t("family"), value: "Family" },
        { label: t("bachelor"), value: "Bachelor" },
        { label: t("female"), value: "Female" },
        { label: t("any"), value: "Any" },
    ]
});