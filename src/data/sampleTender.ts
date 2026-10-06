import { RequirementsFile } from '../types/tender';

export const sampleTender: RequirementsFile = {
  tender: {
    tender_id: "WD-2026-RHD-049",
    title: "Construction of 4-Lane Elevated Flyover & Connected Approach Roads (Package-02)",
    procuring_entity: "Roads and Highways Department (RHD), Ministry of Road Transport and Bridges",
    bidder: "Apex Infrastructure & Engineering Consortium Ltd.",
    submission_deadline: "2026-10-15"
  },
  requirements: [
    {
      "id": "req-01",
      "order": 1,
      "title_en": "Valid Trade License (Current Financial Year)",
      "title_bn": "হালনাগাদ ট্রেড লাইসেন্স (চলতি অর্থবছর)",
      "mandatory": true,
      "has_expiry": true
    },
    {
      "id": "req-02",
      "order": 2,
      "title_en": "Taxpayer Identification Certificate (TIN) & Proof of Tax Return",
      "title_bn": "টিআইএন সনদ ও আয়কর রিটার্ন দাখিলের প্রমাণপত্র",
      "mandatory": true,
      "has_expiry": false
    },
    {
      "id": "req-03",
      "order": 3,
      "title_en": "Value Added Tax (VAT) Registration Certificate (BIN)",
      "title_bn": "মূসক নিবন্ধন সনদ (বিআইএন)",
      "mandatory": true,
      "has_expiry": false
    },
    {
      "id": "req-04",
      "order": 4,
      "title_en": "Tender Security / Bank Guarantee (Unconditional)",
      "title_bn": "দরপত্র জামানত / শর্তহীন ব্যাংক গ্যারান্টি",
      "mandatory": true,
      "has_expiry": true
    },
    {
      "id": "req-05",
      "order": 5,
      "title_en": "Audited Financial Balance Sheets & Turnover Records (Past 3 Years)",
      "title_bn": "নিরীক্ষিত আর্থিক স্থিতিপত্র ও বার্ষিক লেনদেন (বিগত ৩ বছর)",
      "mandatory": true,
      "has_expiry": false
    },
    {
      "id": "req-06",
      "order": 6,
      "title_en": "Specific Bridge/Flyover Work Experience Certificate",
      "title_bn": "নির্দিষ্ট সেতু/ফ্লাইওভার নির্মাণের অভিজ্ঞতার সনদ",
      "mandatory": false,
      "has_expiry": false
    },
    {
      "id": "req-07",
      "order": 7,
      "title_en": "Quality Management ISO 9001:2015 Certification",
      "title_bn": "আইএসও ৯০০১:২০১৫ গুণমান নিয়ন্ত্রণ সনদ",
      "mandatory": false,
      "has_expiry": true
    }
  ]
};
