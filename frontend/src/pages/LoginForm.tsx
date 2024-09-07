
import { useForm, SubmitHandler } from "react-hook-form";
import Particles from "react-particles";
import { useCallback } from 'react';
import { loadFull } from "tsparticles";
import { useLocation } from "wouter";
import { Engine } from "tsparticles-engine";
import { AddressBook } from "cypherchat";

const defChatTo = 'Shout';
const defAddContact = 'Paste Contact to Add';
const defInstructions = 'Paste Contact above to add OR Copy contact below to share';

export default function LoginForm() {
    const [, setLocation] = useLocation();
    const { register, handleSubmit } = useForm<FormValues>();
    type FormValues = {
        nickname: string;
        names: string;
        chatTo: string;
        addContact: string;
        instructions: string;
        myContact: string;
    };
    let Nickname = localStorage.getItem("nickname");
    let knownNames = "(none)";
    let chatTo = localStorage.getItem("chatto");
    let AddContact = defAddContact;
    let myContact = "Identity Not Found";

    if (chatTo === null) chatTo = defChatTo;
    if (Nickname === null) Nickname = "Enter Name";
    else {
        let identity = localStorage.getItem(`identity_${Nickname}`);
        let myid = null;
        if (identity !== null) {
          try {
            myid = AddressBook.importIdentity(identity);
            myContact = JSON.stringify({Name: myid.Name, Address: myid.Address, PublicKey: myid.PublicKey});
            let names =myid.ABook.getNames();
            knownNames = 'Known Identities:';
            for (let n in names) {
                knownNames = ` ${knownNames} ${names[n]}`
            }
          } catch (error) {
            console.log(error);
          }
        }
    }
    const onSubmit: SubmitHandler<FormValues> = (data) => {
        const nickname = data.nickname;
        localStorage.setItem("nickname", nickname);
        setLocation("/chat");
        let identity = localStorage.getItem(`identity_${nickname}`);
        if (identity === null ) {
            let myid = AddressBook.createIdentity(nickname);
            identity = AddressBook.exportIdentity(myid);
            localStorage.setItem(`identity_${nickname}`, identity);
        }
        const addContact = data.addContact;
        if (addContact.length > 0 && addContact !== defAddContact) {
            let myid = AddressBook.importIdentity(identity);
            try {
                let jcontact = JSON.parse(addContact);
                myid.ABook.createContact(jcontact.Address, jcontact.Name, jcontact.PublicKey);
                identity = AddressBook.exportIdentity(myid);
                localStorage.setItem(`identity_${nickname}`, identity);
            } catch (error) {
                console.log(error);
            }
        }
        const chatTo = data.chatTo;
        localStorage.setItem("chatto", chatTo);
};
    const particlesInit = useCallback(async (engine: Engine) => {
        await loadFull(engine);
    }, []);

    return (
        <div>
            <form onSubmit={handleSubmit(onSubmit)}>
                <input {...register("nickname")}  defaultValue={Nickname} required/>
                <input {...register("names")}  defaultValue={knownNames} required/>
                <input {...register("chatTo")}  defaultValue={chatTo} required/>
                <input {...register("addContact")}  defaultValue={AddContact} />
                <input {...register("instructions")}  defaultValue={defInstructions} />
                <input {...register("myContact")}  defaultValue={myContact} />
                <input type="submit" value="Confirm"/>
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
