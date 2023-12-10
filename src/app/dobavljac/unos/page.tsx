"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

import { AdresaDto, DobavljacDto, MestoDto } from "@/app/dto";

import styles from "./page.module.scss";
import { getData, postData } from "@/app/helpers";
import { toast } from "sonner";

export default function DobavljacUnos() {
    const [mesta, setMesta] = useState<MestoDto[]>([]);
    const [adrese, setAdrese] = useState<AdresaDto[]>([]);

    const [selectedMestoID, setSelectedMestoID] = useState<number>(0);
    const [selectedAdresaID, setSelectedAdresaID] = useState<number>(0);
    const [siftaDobavljaca, setSifraDobavljaca] = useState<string>("");
    const [nazivDobavljaca, setNazivDobavljaca] = useState<string>("");

    useEffect(() => {
        getData("http://localhost:4000/mesto", "array").then((result) => {
            setMesta(result);

            if (result.length > 0) {
                setSelectedMestoID(result[0].idMesto);
            }
        });
    }, []);

    useEffect(() => {
        if (!selectedMestoID) return;

        getData(
            `http://localhost:4000/adresa/${selectedMestoID}`,
            "array"
        ).then((result) => {
            setAdrese(result);
            setSelectedAdresaID(result[0].idAdresa);
        });
    }, [selectedMestoID]);

    const saveDobavljac = async () => {
        if (nazivDobavljaca.length === 0) {
            toast.error("Unesite naziv dobavljača!");
            return;
        }

        if (siftaDobavljaca.length === 0) {
            toast.error("Unesite šifru dobavljača!");
            return;
        }

        const dobavljac: DobavljacDto = {
            idAdresa: selectedAdresaID,
            naziv: nazivDobavljaca,
            sifraDobavljaca: +siftaDobavljaca,
        };

        console.log(dobavljac);

        const response = await postData(
            "http://localhost:4000/dobavljac",
            dobavljac
        );

        if (response.status === 200) {
            toast.success("Dobavljač je sačuvan!");
            setNazivDobavljaca("");
            setSifraDobavljaca("");
        } else {
            toast.error("Dobavljač sa datom šifrom već postoji!");
            setSifraDobavljaca("");
        }
    };

    return (
        <main className={styles.unos}>
            <div className={styles.form}>
                <div className={styles.formHeader}>
                    <p>Unos dobavljača</p>
                    <Link className={styles.link} href="/">
                        X
                    </Link>
                </div>
                <div className={styles.formBody}>
                    <div className={styles.inputContainer}>
                        <p>Mesto:</p>
                        <select
                            className={styles.selectStyle}
                            onChange={(e) => {
                                setSelectedMestoID(+e.target.value);
                            }}
                        >
                            {mesta.map((mesto: MestoDto) => (
                                <option value={mesto.idMesto}>
                                    {mesto.nazivMesta}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className={styles.inputContainer}>
                        <p>Adresa:</p>
                        <select
                            className={styles.selectStyle}
                            onChange={(e) => {
                                setSelectedAdresaID(+e.target.value);
                            }}
                        >
                            {adrese.map((adresa: AdresaDto) => (
                                <option value={adresa.nazivAdrese}>
                                    {adresa.nazivAdrese}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className={styles.inputContainer}>
                        <p>Šifra dobavljača:</p>
                        <input
                            type="text"
                            value={siftaDobavljaca}
                            onChange={(e) => {
                                if (
                                    (!isNaN(+e.target.value) &&
                                        +e.target.value > 0) ||
                                    e.target.value === ""
                                ) {
                                    setSifraDobavljaca(e.target.value);
                                }
                            }}
                        />
                    </div>
                    <div className={styles.inputContainer}>
                        <p>Naziv:</p>
                        <input
                            type="text"
                            value={nazivDobavljaca}
                            onChange={(e) => {
                                setNazivDobavljaca(e.target.value);
                            }}
                        />
                    </div>
                    <div
                        className={styles.btn}
                        onClick={() => {
                            saveDobavljac();
                        }}
                    >
                        Sačuvaj
                    </div>
                </div>
            </div>
        </main>
    );
}
