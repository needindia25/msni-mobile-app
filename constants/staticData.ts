import { TFunction } from "i18next";

export const getStaticData = (t: TFunction) => ({
    propertyForOptions: [
        { label: t("rent"), value: "Rent" },
        { label: t("lease"), value: "Lease" }
    ],    
    propertyTypeOptionsForSearch: {
        "Lease": [
            { label: t("any"), value: "Any" },
            { label: t("fullHouse"), value: "Full House" },
            { label: t("commercial"), value: "Commercial" },
            { label: t("land"), value: "Land" },
        ],
        "Rent": [
            { label: t("any"), value: "Any" },
            { label: t("fullHouse"), value: "Full House" },
            { label: t("pgHostel"), value: "PG/Hostel" },
            { label: t("commercial"), value: "Commercial" },
            { label: t("land"), value: "Land" },
            { label: t("guestHouse"), value: "Guest House" },
        ],
    },
    propertyTypeOptions: {
        "Lease": [
            { label: t("fullHouse"), value: "Full House" },
            { label: t("commercial"), value: "Commercial" },
            { label: t("land"), value: "Land" },
        ],
        "Rent": [
            { label: t("fullHouse"), value: "Full House" },
            { label: t("pgHostel"), value: "PG/Hostel" },
            { label: t("commercial"), value: "Commercial" },
            { label: t("land"), value: "Land" },
            { label: t("guestHouse"), value: "Guest House" },
        ],
    },
    roomTypeOptions: [
        { label: t("single"), value: "Single" },
        { label: t("sharing2Beds"), value: "Sharing 2 Beds" },
        { label: t("sharing3Beds"), value: "Sharing 3 Beds" },
        { label: t("sharing4Beds"), value: "Sharing 4 Beds" },
    ],
    guestHouseRoomTypeOptions: [
        { label: t("signalBedAc"), value: "Signal Bed AC" },
        { label: t("signalBedNonAc"), value: "Signal Bed Non AC" },
        { label: t("doubleBedAc"), value: "Double Bed AC" },
        { label: t("doubleBedNonAc"), value: "Double Bed Non AC" },
        { label: t("tripleBedAc"), value: "Triple Bed AC" },
        { label: t("tripleBedNonAc"), value: "Triple Bed Non AC" },
        { label: t("dormitory"), value: "Dormitory" },
        { label: t("familyRoom"), value: "Family Room"},
        { label: t("deluxeRoom"), value: "Deluxe Room"},
        { label: t("suiteRoom"), value: "Suite Room"},
        { label: t("quadRoom"), value: "Quad Room"},
        { label: t("executiveRoom"), value: "Executive Room"},
        { label: t("meetingRoom"), value: "Meeting Room"},
        { label: t("weddingHall"), value: "Wedding Hall"},
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
        { label: t("2And4Wheeler"), value: "2 and 4 Wheeler" },
        { label: t("none"), value: "None" },
    ],
    basicAmenitiesOptions: [
        { label: t("lift"), value: "Lift" },
        { label: t("powerBackup"), value: "Power backup" },
        { label: t("swimmingPool"), value: "Swimming Pool" },
        { label: t("playArea"), value: "Play Area" },
        { label: t("security"), value: "Security" },
        { label: t("none"), value: "None" },
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
        { label: t("none"), value: "None" },
    ],
    sourceOfWaterOptions: [
        { label: t("supplyWater"), value: "Supply Water" },
        { label: t("borewell"), value: "Borewell" },
        { label: t("handPump"), value: "Hand Pump" },
        { label: t("other"), value: "Other" },
    ],
    floors: [
        { label: t("basement"), value: -1 },
        { label: t("groundFloor"), value: 0 },
        { label: t("1stFloor"), value: 1 },
        { label: t("2ndFloor"), value: 2 },
        { label: t("3rdFloor"), value: 3 },
        { label: t("4thFloor"), value: 4 },
        { label: t("5thFloor"), value: 5 },
        { label: t("6thFloor"), value: 6 },
        { label: t("7thFloor"), value: 7 },
        { label: t("8thFloor"), value: 8 },
        { label: t("9thFloor"), value: 9 },
        { label: t("10thFloor"), value: 10 },
        { label: t("11thFloor"), value: 11 },
        { label: t("12thFloor"), value: 12 },
        { label: t("13thFloor"), value: 13 },
        { label: t("14thFloor"), value: 14 },
        { label: t("15thFloor"), value: 15 },
        { label: t("16thFloor"), value: 16 },
        { label: t("17thFloor"), value: 17 },
        { label: t("18thFloor"), value: 18 },
        { label: t("19thFloor"), value: 19 },
        { label: t("20thFloor"), value: 20 },
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
        { label: t("1BathRoom"), value: "1 Bath Room" },
        { label: t("2BathRooms"), value: "2 Bath Rooms" },
        { label: t("3BathRooms"), value: "3 Bath Rooms" },
        { label: t("4BathRooms"), value: "4 Bath Rooms" },
        { label: t("commonBathRomm"), value: "Common Bath Room" },
    ],
    ageOfProperty: [
        { label: t("new"), value: 0 },
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
        { label: t("1rk"), value: "1 RK" },
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