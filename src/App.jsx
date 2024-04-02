import { Button, Grid } from "@mui/material";

import * as Tone from 'tone'

export default function App() {

    const start = async () => {
        await Tone.start()
        console.log('click');
    }
    var loops = []
    var players = []


    const patterns = [
        {
            name: 'Attach&Release',
            f: () => {
                //play a middle 'C' for the duration of an 8th note
                const synth = new Tone.Synth().toDestination();
                synth.triggerAttackRelease("C4", "8n");
            }
        },

        {
            name: 'Attach/Release',
            f: () => {
                const now = Tone.now()
                const synth = new Tone.Synth().toDestination();
                // trigger the attack immediately
                synth.triggerAttack("C4", now)
                // wait one second before triggering the release
                synth.triggerRelease(now + 1)
            }
        },

        {
            name: 'Delay',
            f: () => {
                const now = Tone.now()
                const synth = new Tone.Synth().toDestination();
                synth.triggerAttackRelease("C4", "8n", now)
                synth.triggerAttackRelease("E4", "8n", now + 0.5)
                synth.triggerAttackRelease("G4", "8n", now + 1)
            }
        },

        {
            name: 'Loop',
            f: () => {
                // create two monophonic synths
                const synthA = new Tone.FMSynth().toDestination();
                const synthB = new Tone.AMSynth().toDestination();
                //play a note every quarter-note
                const loopA = new Tone.Loop(time => {
                    synthA.triggerAttackRelease("C2", "8n", time);
                }, "4n").start(0);
                loops.push(loopA)

                //play another note every off quarter-note, by starting it "8n"
                const loopB = new Tone.Loop(time => {
                    synthB.triggerAttackRelease("C4", "8n", time);
                }, "4n").start("8n");

                loops.push(loopB)

                // the loops start when the Transport is started
                Tone.Transport.start()
                Tone.Transport.bpm.rampTo(800, 10);
            }
        },

        {
            name: 'Multi',
            f: () => {
                // multiple notes
                const synth = new Tone.PolySynth(Tone.Synth).toDestination();
                const now = Tone.now()
                synth.triggerAttack("D4", now);
                synth.triggerAttack("F4", now + 0.5);
                synth.triggerAttack("A4", now + 1);
                synth.triggerAttack("C5", now + 1.5);
                synth.triggerAttack("E5", now + 2);
                synth.triggerRelease(["D4", "F4", "A4", "C5", "E5"], now + 4);
            }
        },

        {
            name: 'Load',
            f: () => {
                const player = new Tone.Player("https://tonejs.github.io/audio/berklee/gong_1.mp3").toDestination();
                Tone.loaded().then(() => {
                    player.start();
                });
            }
        },

        {
            name: 'Sampler',
            f: () => {
                const sampler = new Tone.Sampler({
                    urls: {
                        "C4": "C4.mp3",
                        "D#4": "Ds4.mp3",
                        "F#4": "Fs4.mp3",
                        "A4": "A4.mp3",
                    },
                    release: 1,
                    baseUrl: "https://tonejs.github.io/audio/salamander/",
                }).toDestination();

                Tone.loaded().then(() => {
                    sampler.triggerAttackRelease(["Eb4", "G4", "Bb4"], 4);
                })
            }
        },

        {
            name: 'Effect',
            f: () => {
                const player = new Tone.Player({
                    url: "https://tonejs.github.io/audio/berklee/gurgling_theremin_1.mp3",
                    loop: true,
                    autostart: true,
                })
                //create a distortion effect
                const distortion = new Tone.Distortion(0.4).toDestination();
                //connect a player to the distortion
                player.connect(distortion);
                players.push(player)
            }
        },

        {
            name: 'Effects',
            f: () => {
                const player = new Tone.Player({
                    url: "https://tonejs.github.io/audio/drum-samples/loops/ominous.mp3",
                    autostart: true,
                });
                const filter = new Tone.Filter(400, 'lowpass').toDestination();
                const feedbackDelay = new Tone.FeedbackDelay(0.125, 0.5).toDestination();

                // connect the player to the feedback delay and filter in parallel
                player.connect(filter);
                player.connect(feedbackDelay);
                players.push(player)
            }
        },

        {
            name: 'Signal',
            f: () => {
                const osc = new Tone.Oscillator().toDestination();
                // start at "C4"
                osc.frequency.value = "C4";
                // ramp to "C2" over 2 seconds
                osc.frequency.rampTo("C2", 2);
                // start the oscillator for 2 seconds
                osc.start().stop("+3");
            }
        },


        {
            name: 'Stop',
            f: () => {
                loops.forEach(l => l.stop())
                players.forEach(p => p.stop())

                loops = []
                players = []

                Tone.Transport.stop()
                Tone.Transport.cancel();
            }
        },
    ]

    return <>
        <Grid
            container
            direction="column"
            justifyContent="flex-start"
            alignItems="flex-start"
            spacing={1}
            className="container"
        >
            {patterns.map((p, i) => (
                <Grid item
                    key={i}>
                    <Button
                        variant="outlined"
                        onClick={() => {
                            start()
                            p.f()
                        }}
                    >
                        {p.name}
                    </Button>
                </Grid>
            ))}
        </Grid>
    </>
}