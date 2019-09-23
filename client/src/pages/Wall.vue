<template>
    <main>
        <div class="primary-photo photo" v-if="images.length > 0">
            <img :src="images[0].url"/>
            <img :src="frameSrc(images[0].frame)" class="upload-frame" alt="upload-frame"/>
        </div>

        <div class="secondary-photos">
            <ul class="gallery">
                <li v-for="image in secondaryImages" v-bind:key="image.id" class="photo">
                    <img :src="image.url"/>
                    <img :src="frameSrc(image.frame)" class="upload-frame" alt="upload-frame"/>
                </li>
            </ul>
        </div>
    </main>
</template>

<script>
    import Pusher from 'pusher-js';
    import axios from 'axios';


    export default {
        name: 'Wall',

        props: ['baseUrl', 'pusherAppId'],

        data() {
            return {
                images: []
            }
        },

        computed: {
            secondaryImages: function () {
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


            channel.bind("upload", ({image}) => {
                console.log('PUSHER RECIEVED', image);
                this.images = [image, ...this.images];
            });

            // Requests last images

            const {data} = await axios.get(`${this.baseUrl}/list`);

            this.images = data;

        }

    };
</script>

<style scoped>

main {
    justify-content: space-between;
}

.photo {
    position: relative;
    display: inline-block;
    width: 804px;
    height: 604px;
}
.photo img {
    width: 796px;
    height: 596px;
}
.upload-frame {
    z-index: 10;
    position: absolute;
    border: 4px solid #0b48d8;
    left: 0;
    top: 0;
    width: 796px;
    height: 596px;
}
</style>
