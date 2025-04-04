<template>
  <div class="popup-js active">
    <section>
      <h3 class="flexline clipoverflow">
        <img v-if="icon" :src="icon" class="icontitle" />
        <font-awesome-icon v-else icon="fa-solid fa-location-dot" />
        {{ addressformatted }}
      </h3>
    </section>

    <div class="scrollable-y">
      <section class="flexline space-between">
        <div class="flexline">
          <input v-if="!realtime" type="date" v-model="start" :max="maxDate" />
          <Bookmark
            v-if="sensor_id"
            :id="sensor_id"
            :address="address?.address && address?.address.join(', ')"
            :link="sensor_id"
            :geo="geo"
          />
        </div>
        <div class="shared-container">
          <button @click="shareData" class="button">
            <font-awesome-icon icon="fa-solid fa-share-from-square" v-if="!shared" />
            <font-awesome-icon icon="fa-solid fa-check" v-if="shared" />
          </button>
          <button @click="shareLink" class="button">
            <span v-if="!simpleShared">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512">
                <path
                  d="M579.8 267.7c56.5-56.5 56.5-148 0-204.5c-50-50-128.8-56.5-186.3-15.4l-1.6 1.1c-14.4 10.3-17.7 30.3-7.4 44.6s30.3 17.7 44.6 7.4l1.6-1.1c32.1-22.9 76-19.3 103.8 8.6c31.5 31.5 31.5 82.5 0 114L422.3 334.8c-31.5 31.5-82.5 31.5-114 0c-27.9-27.9-31.5-71.8-8.6-103.8l1.1-1.6c10.3-14.4 6.9-34.4-7.4-44.6s-34.4-6.9-44.6 7.4l-1.1 1.6C206.5 251.2 213 330 263 380c56.5 56.5 148 56.5 204.5 0L579.8 267.7zM60.2 244.3c-56.5 56.5-56.5 148 0 204.5c50 50 128.8 56.5 186.3 15.4l1.6-1.1c14.4-10.3 17.7-30.3 7.4-44.6s-30.3-17.7-44.6-7.4l-1.6 1.1c-32.1 22.9-76 19.3-103.8-8.6C74 372 74 321 105.5 289.5L217.7 177.2c31.5-31.5 82.5-31.5 114 0c27.9 27.9 31.5 71.8 8.6 103.9l-1.1 1.6c-10.3 14.4-6.9 34.4 7.4 44.6s34.4 6.9 44.6-7.4l1.1-1.6C433.5 260.8 427 182 377 132c-56.5-56.5-148-56.5-204.5 0L60.2 244.3z"
                />
              </svg>
            </span>
            <font-awesome-icon icon="fa-solid fa-check" v-if="simpleShared" />
          </button>
        </div>
      </section>

      <section v-if="realtime" class="flexline">
        <div>
          <div class="rt-title">Realtime view mode</div>
          <div v-if="rttime" class="rt-time">{{ rttime }}</div>
        </div>

        <template v-if="rtdata">
          <div v-for="item in rtdata" :key="item">
            <div class="rt-unit">{{ item.label }}</div>
            <div class="rt-number" :style="item.color ? 'color:' + item.color : ''">
              {{ item.measure }} {{ item.unit }}
            </div>
          </div>
        </template>
      </section>

      <section>
        <div v-if="isLoad">{{ $t("isLoad") }}</div>
        <Chart v-else :point="point" :log="log" />
      </section>

      <section>
        <h3>{{ $t("sensorpopup.infotitle") }}</h3>
        <div class="infoline flexline" v-if="sensor_id">
          <div class="infoline-title">{{ $t("sensorpopup.infosensorid") }}:</div>
          <div class="infoline-info">
            {{ $filters.collapse(sensor_id) }}
            <Copy
              :msg="sensor_id"
              :title="`Sensor id: ${sensor_id}`"
              :notify="$t('details.copied')"
            />
          </div>
        </div>

        <div class="infoline flexline" v-if="geo">
          <div class="infoline-title">{{ $t("sensorpopup.infosensorgeo") }}:</div>
          <div class="infoline-info">{{ geo.lat }}, {{ geo.lng }}</div>
        </div>

        <div class="infoline flexline" v-if="link">
          <div class="infoline-title">{{ $t("sensorpopup.infosensorowner") }}:</div>
          <div class="infoline-info">
            <a :href="link" rel="noopener" target="_blank">{{ link }}</a>
          </div>
        </div>

        <div class="infoline flexline" v-if="donated_by">
          <div class="infoline-title">{{ $t("sensorpopup.infosensordonated") }}:</div>
          <div class="infoline-info">{{ donated_by }}</div>
        </div>

        <!-- Это не смогла проверить как работает (@positivecrash) -->
        <div v-if="model === 3" class="infoline flexline">
          <div class="infoline-title">
            <label for="realtime"></label>
            <span class="sensors-switcher-text"> {{ $t("details.showpath") }} </span>:
          </div>
          <div class="infoline-info">
            <input type="checkbox" id="realtime" v-model="isShowPath" />
          </div>
        </div>
      </section>

      <section v-if="units && scales && scales.length > 0">
        <h3>{{ $t("scales.title") }}</h3>
        <div class="scalegrid">
          <div v-for="item in scales" :key="item.label">
            <template v-if="item?.zones && (item.name || item.label)">
              <p>
                <b v-if="item.name">{{ item.name[locale] ? item.name[locale] : item.name.en }}</b>
                <b v-else>{{ item.label }}</b>
                ({{ item.unit }})
              </p>
              <template v-for="zone in item.zones" :key="zone.color">
                <div
                  class="scales-color"
                  v-if="zone.color && zone.label"
                  :style="`--color: ${zone.color}`"
                >
                  <b>{{ zone.label[locale] ? zone.label[locale] : zone.label.en }}</b>
                  (<template v-if="zone.value">{{ $t("scales.upto") }} {{ zone.value }}</template>
                  <template v-else>{{ $t("scales.above") }}</template
                  >)
                </div>
              </template>
            </template>
          </div>
        </div>
      </section>

      <div class="textsmall">
        <template v-if="isLocationRussion">{{ $t("notice_with_fz") }}</template>
        <template v-else>{{ $t("notice_without_fz") }}</template>
      </div>
    </div>

    <button @click.prevent="closesensor" aria-label="Close sensor" class="close">
      <font-awesome-icon icon="fa-solid fa-xmark" />
    </button>
  </div>
</template>

<script>
import { useStore } from "@/store";
import config, { sensors } from "@config";
import moment from "moment";
import measurements from "../../measurements";
import { toFixed } from "../../measurements/tools";
import generate, { getState } from "../../utils/color";
import { hidePath, showPath } from "../../utils/map/marker";
import { getTypeProvider } from "../../utils/utils";
import Bookmark from "./Bookmark.vue";
import Chart from "./Chart.vue";
import Copy from "./Copy.vue";

export default {
  emits: ["close"],
  props: ["type", "point", "startTime"],
  components: { Chart, Copy, Bookmark },
  data() {
    return {
      select: "",
      measurement: this.type,
      isShowPath: false,
      store: useStore(),
      start: moment().format("YYYY-MM-DD"),
      maxDate: moment().format("YYYY-MM-DD"),
      provider: this.$route.params.provider,
      rttime: null /* used for realtime view */,
      rtdata: [] /* used for realtime view */,
      shared: false /* status for share button */,
      simpleShared: false /* status for simple (not os) share button */,
      isLoad: false,
    };
  },
  computed: {
    locale() {
      return localStorage.getItem("locale") || this.$i18n.locale || "en";
    },

    address() {
      return this.point.address;
    },
    donated_by() {
      return this.point.donated_by;
    },
    geo() {
      return this.point.geo;
    },
    log() {
      return this.point?.log;
    },
    model() {
      return this.point.model;
    },
    sender() {
      return this.point.sender;
    },
    sensor_id() {
      return this.point.sensor_id;
    },

    realtime() {
      return this.provider === "realtime";
    },

    addressformatted() {
      let bufer = "";
      if (this.address) {
        if (this.address.country) {
          bufer += this.address.country;
        }
        if (this.address.address.length > 0) {
          bufer += ", " + this.address.address.join(", ");
        }
      }
      return bufer;
    },
    isLocationRussion() {
      return this.address.country === "Россия" || this.address.country === "Russia";
    },
    measure() {
      return this.items.find((item) => this.select === item.text);
    },

    scale() {
      return generate(
        measurements[this.type.toLowerCase()].colors,
        measurements[this.type.toLowerCase()].range
      );
    },
    hasIcon() {
      return (type) => measurements[type.toLowerCase()] && measurements[type.toLowerCase()].icon;
    },
    items() {
      const items = [];
      for (const item of Object.keys(this.last.data)) {
        let scale = null;
        if (measurements[item.toLowerCase()] && measurements[item.toLowerCase()].colors) {
          scale = generate(
            measurements[item.toLowerCase()].colors,
            measurements[item.toLowerCase()].range
          );
        }
        items.push({
          id: item,
          title: this.$filters.measurementFormat(this.last.data[item], item),
          text: this.$filters.measurement(item),
          state: getState(
            scale,
            this.last.data[item],
            measurements[item.toLowerCase()] ? measurements[item.toLowerCase()].states : undefined
          ),
        });
      }
      return items;
    },
    measurementFilter(value) {
      return measurements[value.toLowerCase()]?.label || value;
    },
    measurementFormat(value, type) {
      return measurements[type.toLowerCase()]
        ? `${toFixed(value)} ${measurements[type.toLowerCase()].unit}`
        : toFixed(value);
    },
    collapse(value) {
      if (!value) {
        return "";
      }
      return value.slice(0, 6) + "..." + value.slice(-4);
    },
    linkSensor: function () {
      const route = this.$router.resolve({
        name: "main",
        params: {
          provider: getTypeProvider(),
          type: this.$route.params.type || "pm10",
          zoom: this.$route.params.zoom || config.MAP.zoom,
          lat: this.geo.lat,
          lng: this.geo.lng,
          sensor: this.sensor_id,
        },
      });
      return new URL(route.href, window.location.origin).href;
    },
    link: function () {
      return sensors[this.sensor_id] ? sensors[this.sensor_id].link : "";
    },
    icon: function () {
      return sensors[this.sensor_id] ? sensors[this.sensor_id].icon : "";
    },
    last: function () {
      return this.log[this.log.length - 1];
    },
    date: function () {
      return moment(this.last.timestamp, "X").format("DD.MM.YYYY HH:mm:ss");
    },
    startTimestamp: function () {
      return Number(moment(this.start + " 00:00:00", "YYYY-MM-DD HH:mm:ss").format("X"));
    },
    endTimestamp: function () {
      return Number(moment(this.start + " 23:59:59", "YYYY-MM-DD HH:mm:ss").format("X"));
    },
    units() {
      /* + Possible units for the sensor */
      let measures = [];
      Object.values(this.log).forEach((item) => {
        if (item.data) {
          Object.keys(item.data).forEach((unit) => {
            measures.push(unit.toLowerCase());
          });
        }
      });
      return [...new Set(measures.flat())];
    },
    scales: function () {
      let bufer = [];
      /* + Get nessesary scales */
      Object.keys(measurements).forEach((key) => {
        if (
          this.units.some((item) => {
            return item === key;
          })
        ) {
          bufer.push(measurements[key]);
        }
      });

      return bufer;
    },
  },
  methods: {
    shareData() {
      if (!navigator.share) {
        navigator.clipboard
          .writeText(this.linkSensor)
          .then(() => {
            this.shared = true;
            setTimeout(() => {
              this.shared = false;
            }, 5000);
          })
          .catch((e) => {
            console.log("not coppied", e);
          });
      } else {
        navigator.share({
          title: config.TITLE,
          url: this.linkSensor || this.link,
        });
      }
    },
    shareLink() {
      navigator.clipboard
        .writeText(this.linkSensor)
        .then(() => {
          this.simpleShared = true;
          setTimeout(() => {
            this.simpleShared = false;
          }, 5000);
        })
        .catch((e) => {
          console.log("not coppied", e);
        });
    },
    getHistory() {
      if (this.realtime) {
        return;
      }
      this.isLoad = true;
      this.$emit("history", {
        sensor_id: this.sensor_id,
        start: this.startTimestamp,
        end: this.endTimestamp,
      });
    },
    updatert() {
      if (this.realtime) {
        /* get last time */
        const ts = this.log[this.log.length - 1].timestamp * 1000;
        if (ts) {
          this.rttime = new Date(ts).toLocaleString();
        }

        /* get last data */
        const data = this.log[this.log.length - 1].data;
        let bufer = {};

        if (data) {
          this.rtdata = [];
          Object.keys(measurements).forEach((item) => {
            Object.keys(data).forEach((datakey) => {
              if (item === datakey) {
                bufer = {};
                bufer.key = datakey;
                bufer.measure = data[datakey];
                bufer.label = measurements[item].label;
                bufer.unit = measurements[item].unit;
                if (
                  measurements[item].zones &&
                  measurements[item].zones.find((i) => bufer.measure < i.value)
                ) {
                  bufer.color = measurements[item].zones.find((i) => bufer.measure < i.value).color;
                }

                /* check for upper measure */
                if (!bufer.color) {
                  if (
                    measurements[item].zones &&
                    bufer.measure >
                      measurements[item].zones[measurements[item].zones.length - 2].value
                  ) {
                    bufer.color =
                      measurements[item].zones[measurements[item].zones.length - 1].color;
                  }
                }

                this.rtdata.push(bufer);
              }
            });
          });
        }
      }
    },

    closesensor() {
      /* this is for removing sensor id, it goes from dummy reload in bookmark,
      that I needed as couldn't manage proper handle for the openning - @positivecrash */
      const urlstr = window.location.href;
      if (urlstr.includes(this.sensor_id)) {
        const u = urlstr.replace(this.sensor_id, "");
        window.location.href = u;
      }

      this.$emit("close");
    },
  },
  watch: {
    sensor_id() {
      this.isShowPath = false;
    },
    isShowPath() {
      if (this.isShowPath) {
        showPath(this.sensor_id);
      } else {
        hidePath(this.sensor_id);
      }
    },
    start() {
      this.getHistory();
    },
    log() {
      this.updatert();

      this.isLoad = false;
    },
  },
  mounted() {
    this.start = this.startTime
      ? moment.unix(this.startTime).format("YYYY-MM-DD")
      : moment().format("YYYY-MM-DD");

    this.updatert();
  },
};
</script>

<style scoped>
.popup-js.active {
  container: popup / inline-size;
  background: var(--app-popoverbg);
  border-radius: 0;
  bottom: 0;
  box-sizing: border-box;
  color: var(--app-textcolor);
  padding: var(--gap);
  position: absolute;
  right: 0;
  top: 0;
  width: 80vw;
  max-width: 1000px;
  z-index: 100;
}

.scrollable-y {
  max-height: 90%;
}

.close {
  border: 0;
  color: var(--app-textcolor);
  cursor: pointer;
  font-size: 1.2em;
  position: absolute;
  right: var(--gap);
  top: var(--gap);
}

.close:hover {
  color: var(--color-red);
}

.flexline {
  gap: calc(var(--gap) * 2);
}

.flexline .flexline {
  gap: var(--gap);
}

h3.flexline {
  gap: calc(var(--gap) * 0.5);
  max-width: calc(100% - var(--gap) * 2);
}

.icontitle {
  display: inline-block;
  max-height: calc(var(--font-size) * 2);
}

@media screen and (max-width: 700px) {
  .popup-js.active {
    left: 0;
    width: 100vw;
    top: 30vw;
    padding-right: calc(var(--gap) * 0.5);
  }
}

@container popup (min-width: 400px) {
  .close {
    font-size: 1.6em;
  }
}

@container popup (max-width: 400px) {
  h3.flexline {
    max-width: calc(100% - var(--gap) * 3);
  }
}

.infoline.flexline {
  gap: calc(var(--gap) * 0.5);
}

.infoline-title {
  font-weight: bold;
}

/* shared container */
.shared-container button:first-of-type {
  margin-right: 10px;
}

.shared-container span {
  display: block;
  width: 20px;
  height: 20px;
}

.shared-container span svg {
  fill: var(--color-light);
}

@media screen and (max-width: 570px) {
  .shared-container {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .shared-container button:first-of-type {
    margin-right: 0;
  }
}
/* shared container */

/* + scales */
.scalegrid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--gap);
  font-size: 0.8em;
}
.scalegrid p {
  margin-bottom: calc(var(--gap) * 0.5);
}

.scales-color {
  position: relative;
  padding-left: calc(var(--gap) * 2);
}

.scales-color:before {
  content: "";
  display: block;
  position: absolute;
  background-color: var(--color);
  top: 0;
  left: 0;
  bottom: 0;
  width: var(--gap);
}
/* - scales */

/* + realtime */
.rt-title {
  font-weight: 900;
}

.rt-title::before {
  animation: blink infinite 1.5s;
  background-color: var(--color-green);
  border-radius: 50%;
  content: "";
  display: inline-block;
  height: 8px;
  margin-right: 5px;
  vertical-align: middle;
  width: 8px;
}

.rt-time {
  font-size: 0.8em;
  font-weight: 300;
  padding-left: 13px;
}

.rt-unit,
.rt-number {
  font-size: 0.8em;
  font-weight: 900;
}
/* - realtime */
</style>
