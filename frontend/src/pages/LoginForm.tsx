
import { useForm, SubmitHandler } from "react-hook-form";
import Particles from "react-particles";
import { useCallback } from 'react';
import { loadFull } from "tsparticles";
import { useLocation } from "wouter";
import { Engine } from "tsparticles-engine";
import ChatProps from "../ChatProps";
import { Identity } from "fluxchat";

const defChatTo = 'Shout';
const defAddContact = 'Paste Contact to Add';
const defInstructions = 'Paste Contact above to add OR Copy contact below to share';

const LoginForm: React.FC<ChatProps> = ({ fluxchat }) => {
    const [, setLocation] = useLocation();
    const { register, handleSubmit } = useForm<FormValues>();
    type FormValues = {
        nickname: string;
        addContact: string;
        myContact: string;
    };
    let Nickname = localStorage.getItem("nickname");
    let chatTo = localStorage.getItem("chatto");
    let myContact = "Identity Not Found";

    if (chatTo === null) {
        chatTo = defChatTo;
        localStorage.setItem("chatto", chatTo);
    }
    if (Nickname === null) Nickname = "Enter Name";
    else {
        if (fluxchat.loadIdentity(Nickname)) { // id is valid
            const myid:Identity = fluxchat.getMyIdentity();
            myContact = JSON.stringify({Name: myid.Name, Address: myid.Address, PublicKey: myid.PublicKey});
        }
    }
    const onSubmit: SubmitHandler<FormValues> = (data) => {
        const nickname = data.nickname;
        console.log(`nickname: ${nickname}`);
        if (nickname !== localStorage.getItem("nickname") || !fluxchat.serverIsConnected()) {
            fluxchat.serverDisconnect();
            if (!fluxchat.loadIdentity(nickname)) { // id invalid
                fluxchat.createIdentity(nickname); // Create one
            }
            if (fluxchat.loadIdentity(nickname)) { // id is valid
                localStorage.setItem("nickname", nickname);
                setLocation("/chat");
                fluxchat.serverConnect();
            }
        }
        const addContact = data.addContact;
        console.log(`addContact: ${addContact}`);
        if (addContact.length > 0) {
            try {
                let jcontact = JSON.parse(addContact);
                fluxchat.createContact(jcontact.Address, jcontact.Name, jcontact.PublicKey);
            } catch (error) {
                console.log(error);
            }
        }
    };
    const particlesInit = useCallback(async (engine: Engine) => {
        await loadFull(engine);
    }, []);

    return (
        <div>
            <form onSubmit={handleSubmit(onSubmit)}>
                <input id="nicknameInput" {...register("nickname")} defaultValue={Nickname} required />
                <br />
                <label htmlFor="nicknameInput">Nickname:</label>
                <input id="addContactInput" {...register("addContact")} />
                <br />
                <label htmlFor="addContactInput">Contact to Add:</label>
                <br />
                <label htmlFor="myContactInput">My Contact</label>
                <textarea
                    value={myContact}
                      style={{
                        width: "100%",
                        height: "200px",
                        padding: "10px",
                        fontSize: "16px",
                      }}
                    readOnly
                />
                <button onClick={() => navigator.clipboard.writeText(myContact)}>Copy Contact</button>
                <input type="submit" value="Confirm" />
            </form>
            <Particles
            id="tsparticles"
            init={particlesInit}
            options={{
                fpsLimit: 120,
                interactivity: {
                    events: {
                        onClick: {
                            enable: true,
                            mode: "push",
                        },
                        onHover: {
                            enable: true,
                            mode: "repulse",
                        },
                        resize: true,
                    },
                    modes: {
                        push: {
                            quantity: 4,
                        },
                        repulse: {
                            distance: 200,
                            duration: 0.4,
                        },
                    },
                },
                particles: {
                    color: {
                        value: "#ffffff",
                    },
                    links: {
                        color: "#ffffff",
                        distance: 150,
                        enable: true,
                        opacity: 0.5,
                        width: 3,
                    },
                    collisions: {
                        enable: true,
                    },
                    move: {
                        direction: "none",
                        enable: true,
                        outModes: {
                            default: "bounce",
                        },
                        random: true,
                        speed: 3,
                        straight: false,
                    },
                    number: {
                        density: {
                            enable: true,
                            area: 800,
                        },
                        value: 100,
                    },
                    opacity: {
                        value: 0.5,
                    },
                    shape: {
                        type: "circle",
                    },
                    size: {
                        value: { min: 4, max: 5 },
                    },
                },
                detectRetina: true,
            }}
        />
        </div>
      );
    
}
export default LoginForm;