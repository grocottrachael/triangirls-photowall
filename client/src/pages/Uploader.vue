<template>
    <div class="upload">
        <!-- Camera -->
        <div class="upload-logo-container">
            <img src="../assets/triangirls-logo-full.png" class="upload-logo"/>
        </div>
        <img src="../assets/triangirls-one.png" class="upload-bg--balloons"/>
        <img src="../assets/triangirls-one.png" class="upload-bg--one"/>

        <main id="camera">
            <div id="camera-canvas"></div>
            <img :src="frameSrc(picturesTaken)" class="upload-frame" alt="upload-frame"/>

            <div v-if="status === 'uploading'">
                <countdown :end-time="new Date().getTime() + 3000" @finish="uploadPhoto">
                    <p slot="process" slot-scope="time">{{ `Get ready! Photo in: ${time.timeObj.ceil.s}` }}</p>
                    <p slot="finish">Uploading...</p>
                </countdown>
            </div>

            <p v-if="status === 'ready'">Press any key to upload photo</p>
            <p v-if="status === 'success'">Photo uploaded</p>
            <p v-if="status === 'failure'">Photo upload failed. Please try again</p>
        </main>

        <div class="upload-logo-container">
            <img src="../assets/pusher.png" id="pusher" class="upload-logo--small"/>
        </div>
    </div>
</template>

<script>
    import axios from 'axios';
    import P5 from 'p5';
    import "p5/lib/addons/p5.dom";


    const keydownHandler = function () {
        if (this.status !== 'ready') {
            return;
        }

        this.status = 'uploading';
    };

    export default {
        name: 'Uploader',

        props: ['baseUrl'],

        data() {
            return {
                status: "ready",
                picturesTaken: 0
            }
        },

        async mounted() {

            // Set up P5, which handles the canvas/capture
            new P5((p) => {
                let canvas, capture;
                Object.assign(p, {
                    setup() {
                        canvas = p.createCanvas(800, 600);
                        capture = p.createCapture(p.VIDEO);
                        capture.size(500, 500);
                        capture.hide();
                        canvas.parent("#camera-canvas");

                        p.background(255, 0, 200);
                    },
                    draw() {
                        p.background(0);
                        p.image(capture, 0, 0, p.width, p.height);
                    }
                });
            }, 'camera-canvas');

            // Starts the countdown timer on keydown

            window.addEventListener('keydown', keydownHandler.bind(this));

        },

        unmounted() {
            window.removeEventListener('keydown', keydownHandler.bind(this));
        },

        methods: {
            async uploadPhoto() {
                const c = document.querySelectorAll("canvas")[0];
                this.fileChangedHandler(c.toDataURL("image/png"));
            },
            fileChangedHandler(base64Image) {
                axios.post(`${this.baseUrl}/push`, {
                    image: base64Image,
                    frame: this.picturesTaken % 4
                })
                    .then(() => this.status = 'success')
                    .catch(() => this.status = 'failure')
                    .finally(() => setTimeout(() => {
                        this.status = 'ready';
                        this.picturesTaken++;
                    }, 2000));
            },
            frameSrc(picturesTaken) {
                const frameIndex = (picturesTaken % 4) + 1;
                return require(`../assets/frame-${frameIndex}.png`);
            }
        }
    };
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
    ul.gallery li {
        position: relative;
    }

    ul.gallery li img {
        width: 200px;
        height: 150px;
    }

    #camera {
        width: 800px;
        height: 600px;
        display: inline-block;
        position: relative;
        margin-top: -3rem;
    }

    .upload {
        display: flex;
        flex-direction: column;
        justify-content: space-around;
        align-items: center;
        height: 100vh;
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

    .upload-logo-container {
        display: flex;
        justify-content: center;
    }

    .upload-logo {
        width: 30%;
    }

    .upload-logo--small {
        width: 10%;
    }

    .upload-bg--balloons {
        position: absolute;
        z-index: 1;
        width: 30%;
        top: 3vh;
        right: -13vw;
    }

    .upload-bg--one {
        position: absolute;
        z-index: 1;
        width: 40%;
        left: 3vw;
        bottom: -10%;
    }

    @media only screen and (min-width: 1300px) {
        .upload-bg--one {
            bottom: -30%;
        }
    }

</style>
