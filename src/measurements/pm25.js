import { toFixed } from "./tools";

export default {
  label: "PM2.5",
  name: {
    en: "Particulate matter with diameter ≤ 2.5 µm (PM2.5)",
    ru: "Взвешенные частицы диаметром до 2,5 мкм (PM2.5)"
  },
  nameshort: {
    en: "PM2.5",
    ru: "PM2.5"
  },
  unit: "μg/m3",
  chartColor: "#89b268",
  colors: ["#60bc2a", "#ff9d00", "#fc0202"],
  range: [0, 30, 55, 110, 250],
  zones: [
    {
      value: 30,
      color: "#60bc2a",
      label: {
        en: "Good",
        ru: "Хорошо"
      }
    },
    {
      value: 55,
      color: "#12bfcc",
      label: {
        en: "Satisfyingly",
        ru: "Приемлемо"
      }
    },
    {
      value: 110,
      color: "#ff9d00",
      label: {
        en: "Unhealthy",
        ru: "Вредно для здоровья"
      }
    },
    {
      value: 250,
      color: "#ff4d00",
      label: {
        en: "Very Unhealthy",
        ru: "Очень вредно для здоровья"
      }
    },
    {
      color: "#7a00da",
      label: {
        en: "Unacceptable",
        ru: "Неприемлемо"
      }
    }
  ],
  calculate: function (v) {
    return toFixed(v);
  },
  info: "Suspended, solid and liquid particles with a diameter of 2.5 microns are an air pollutant."
};
