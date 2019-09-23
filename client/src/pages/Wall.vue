<template>
  <main>
    <div class="wall">
      <div class="primary-photo" v-if="images.length > 0">
        <img :src="images[0].url" />
        <img
          :src="frameSrc(images[0].frame)"
          class="upload-frame"
          alt="upload-frame upload-frame--primary"
        />
      </div>

      <div class="secondary-photos">
        <ul class="gallery">
          <li v-for="image in secondaryImages" v-bind:key="image.id" class="photo">
            <img :src="image.url" />
            <img :src="frameSrc(image.frame)" class="upload-frame" alt="upload-frame" />
          </li>
        </ul>
      </div>
    </div>
  </main>
</template>

<script>
import Pusher from "pusher-js";
import axios from "axios";

export default {
  name: "Wall",

  props: ["baseUrl", "pusherAppId"],

  data() {
    return {
      images: []
    };
  },

  computed: {
    secondaryImages: function() {
      return this.images.slice(1, 4);
    }
  },

  methods: {
    frameSrc(i) {
      return require(`../assets/frame-${(i % 4) + 1}.png`);
    }
  },

  async mounted() {
    // Pusher subscription

    const pusher = new Pusher(this.pusherAppId, {
      cluster: "eu",
      encrypted: true
    });

    const channel = pusher.subscribe("gallery");

    channel.bind("upload", ({ image }) => {
      this.images = [image, ...this.images];
    });

    // Requests last images

    const { data } = await axios.get(`${this.baseUrl}/list`);

    this.images = data;
  }
};
</script>

<style scoped>
main {
  /* justify-content: space-between; */
}

.wall {
  display: flex;
  flex-direction: row;
  margin: 0px 3vw;
}
.primary-photo {
  width: 60vw;
  position: relative;
  margin: 2.5em 0;
  align-self: center;
}

@media only screen and (min-width: 1300px) {
  .primary-photo {
    align-self: baseline;
  }
}

.primary-photo img {
  height: 70vh;
}

@media only screen and (min-width: 1300px) {
  .primary-photo img {
    height: 90vh;
  }
}

.secondary-photos {
  margin: 1.5em 0;
}

.photo {
  position: relative;
  display: inline-block;
  margin-bottom: 2.2vh;
  /* width: 800px;
  height: 600px; */
}
.photo img {
  height: 28vh;
}
.upload-frame {
  z-index: 10;
  position: absolute;
  left: 0;
  top: 0;
  height: 28vh;
  /* height: 596px; */
}

.upload-frame--primary {
  z-index: 10;
  position: absolute;
  border: 4px solid #0b48d8;
  left: 4;
  top: ;
  width: 30vw;
  /* height: 596px; */
}

.upload-frame img {
  width: 30vw;
}
</style>
