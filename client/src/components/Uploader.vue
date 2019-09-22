<template>
    <!-- Camera -->
    <main id="camera">
        <div id="camera-canvas"></div>
        <img :src="frameSrc(picturesTaken)" class="upload-frame" alt="upload-frame" />

        <div v-if="status === 'uploading'">
            <countdown :end-time="new Date().getTime() + 3000" @finish='uploadPhoto'>
                <p slot="process" slot-scope="time">{{ `Get ready! Photo in: ${time.timeObj.ceil.s}` }}</p>
                <p slot="finish">Uploading...</p>
            </countdown>
        </div>

        <p v-if="status === 'ready'">Press any key to upload photo</p>
        <p v-if="status === 'success'">Photo uploaded</p>
        <p v-if="status === 'failure'">Photo upload failed. Please try again</p>

    </main>
</template>

<script>
    /* eslint-disable */
    import axios from 'axios';
    import P5 from 'p5';
    import "p5/lib/addons/p5.dom";

    export default {
        name: 'Uploader',

        data() {
            return {
                status: "ready",
                picturesTaken: 0
            }
        },

        created() {

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
            window.addEventListener('keydown', () => {
                if (this.status !== 'ready') {
                    return;
                }

                this.status = 'uploading';
            });
        },

        methods: {
            async uploadPhoto() {
                const c = document.querySelectorAll("canvas")[0];
                const d = c.toDataURL("image/png");
                const b = await fetch(d).then(r => r.blob());
                this.fileChangedHandler(b);
            },
            fileChangedHandler(blob) {
                const formData = new FormData();

                formData.append("image", blob, new Date().toString());

                axios.post("http://localhost:5000/upload", formData)
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

    }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

    #camera {
        width: 800px;
        height: 600px;
        display: inline-block;
        position: relative;
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

    h3 {
        margin: 40px 0 0;
    }

    ul {
        list-style-type: none;
        padding: 0;
    }

    li {
        display: inline-block;
        margin: 0 10px;
    }

    a {
        color: #42b983;
    }
</style>
