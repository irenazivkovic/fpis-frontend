"use client";

import styles from "./page.module.scss";
import { useRouter } from "next/navigation";
import { AdresaDto, DobavljacDto, DobavljacFullDto, MestoDto } from "@/app/dto";
import { getAllData, getData, putData } from "@/app/helpers";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function DobavljacIzmena({
    params,
}: {
    params: { sifra: number };
}) {
    const router = useRouter();

    const [mesta, setMesta] = useState<MestoDto[]>([]);
    const [adrese, setAdrese] = useState<AdresaDto[]>([]);

    const [selectedMestoID, setSelectedMestoID] = useState<number>(0);
    const [selectedAdresaID, setSelectedAdresaID] = useState<number>(0);
    const [siftaDobavljaca, setSifraDobavljaca] = useState<string>("");
    const [nazivDobavljaca, setNazivDobavljaca] = useState<string>("");

    useEffect(() => {
        getData(
            `http://localhost:4000/dobavljac/sifra/${params.sifra}`,
            "object"
        ).then((result: DobavljacFullDto) => {
            setSelectedMestoID(result.adresa.mesto.idMesto);
            setSelectedAdresaID(result.adresa.idAdresa);
            setNazivDobavljaca(result.naziv);
            setSifraDobavljaca(`${result.sifraDobavljaca}`);
        });
    }, []);

    useEffect(() => {
        getAllData("http://localhost:4000/mesto", "array").then((result) => {
            setMesta(result);

            if (result.length > 0) {
                setSelectedMestoID(result[0].idMesto);
            }
        });
    }, []);

    useEffect(() => {
        if (!selectedMestoID) return;

        getAllData(
            `http://localhost:4000/adresa/${selectedMestoID}`,
            "array"
        ).then((result) => {
            setAdrese(result);
            setSelectedAdresaID(result[0].idAdresa);
        });
    }, [selectedMestoID]);

    const izmeniDobavljaca = async () => {
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

        const response = await putData(
            "http://localhost:4000/dobavljac",
            dobavljac
        );

        if (response.status === 200) {
            toast.success("Dobavljač je izmenjen!");
            router.push("/dobavljac/pretraga");
        } else {
            toast.error("Došlo je do greške pri izmeni dobavljača!");
        }
    };

    return (
        <main className={styles.izmenaForm}>
            <div className={styles.form}>
                <div className={styles.formHeader}>
                    <p>Unos dobavljača</p>
                    <Link className={styles.link} href="/dobavljac/pretraga">
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
                                <option value={adresa.idAdresa}>
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
                            disabled={true}
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
                            izmeniDobavljaca();
                        }}
                    >
                        Izmeni
                    </div>
                </div>
            </div>
        </main>
    );
}
