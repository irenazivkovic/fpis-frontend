"use client";

import styles from "./page.module.scss";
import { DobavljacFullDto } from "@/app/dto";
import { deleteData, getData } from "@/app/helpers";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

export default function DobavljacPretraga() {
    const [dobavljaci, setDobavljaci] = useState<DobavljacFullDto[]>([]);
    const [deletionDobavljac, setDeletionDobavljac] =
        useState<DobavljacFullDto>();

    const [nazivDobavljaca, setNazivDobavljaca] = useState<string>("");

    const findDobavljaci = () => {
        if (nazivDobavljaca.length === 0) {
            getData(`http://localhost:4000/dobavljac/`, "array").then(
                (result) => {
                    setDobavljaci(result);
                }
            );
        } else {
            getData(
                `http://localhost:4000/dobavljac/naziv/${nazivDobavljaca}`,
                "array"
            ).then((result) => {
                setDobavljaci(result);
            });
        }
    };

    const deleteDobavljac = async () => {
        const response = await deleteData(
            `http://localhost:4000/dobavljac/${
                deletionDobavljac!.sifraDobavljaca
            }`,
            { sifra: deletionDobavljac!.sifraDobavljaca }
        );

        if (response.status === 200) {
            toast.success("Dobavljač je obrisana");
            setDobavljaci([]);
            await new Promise((resolve) => setTimeout(resolve, 100));
            findDobavljaci();
            setDeletionDobavljac(undefined);
        } else {
            toast.error("Došlo je do greške pri brisanju dobavljača!");
            setDeletionDobavljac(undefined);
        }
    };

    return (
        <main className={styles.pretraga}>
            <div
                className={styles.questionForm}
                style={{
                    visibility:
                        deletionDobavljac === undefined ? "hidden" : "visible",
                }}
            >
                <div className={styles.dialog}>
                    <div className={styles.dialogHeader}>
                        <span />
                        <p
                            id={styles.dialogExit}
                            onClick={() => {
                                setDeletionDobavljac(undefined);
                            }}
                        >
                            X
                        </p>
                    </div>
                    <p>
                        Da li ste sigurni da želite da izbrišete ovog
                        dobavljača?
                    </p>
                    <div
                        className={styles.btnDelete}
                        onClick={() => {
                            deleteDobavljac();
                        }}
                    >
                        Izbriši
                    </div>
                </div>
            </div>
            <div className={styles.form}>
                <div className={styles.formHeader}>
                    <p>Pretraga narudžbenice</p>
                    <Link className={styles.link} href="/">
                        X
                    </Link>
                </div>
                <div className={styles.formBody}>
                    <div className={styles.inputContainer}>
                        <div className={styles.leftSide}>
                            <p>Unesite ime zaposlenog:</p>
                            <input
                                type="text"
                                value={nazivDobavljaca}
                                onChange={(e) => {
                                    setNazivDobavljaca(e.target.value);
                                }}
                            />
                        </div>
                        <div
                            className={styles.findBtn}
                            onClick={() => {
                                findDobavljaci();
                            }}
                        >
                            Pretraži
                        </div>
                    </div>
                    <div className={styles.results}>
                        <div className={styles.resultsHeader}>
                            <table>
                                <thead>
                                    <tr>
                                        <td width="120px">Šifra Dobavljača</td>
                                        <td width="180px">Naziv</td>
                                        <td width="200px">Mesto</td>
                                        <td width="200px">Adresa</td>
                                        <td width="180px"></td>
                                    </tr>
                                </thead>
                            </table>
                        </div>
                        <div className={styles.resultsBody}>
                            <table>
                                <tbody>
                                    {dobavljaci.map((dobavljac) => (
                                        <tr>
                                            <td width="120px">
                                                {dobavljac.sifraDobavljaca}
                                            </td>
                                            <td width="180px">
                                                {dobavljac.naziv}
                                            </td>
                                            <td width="200px">
                                                {
                                                    dobavljac.adresa.mesto
                                                        .nazivMesta
                                                }
                                            </td>
                                            <td width="200px">
                                                {dobavljac.adresa.nazivAdresa}
                                            </td>
                                            <td width="180px">
                                                <Link
                                                    className={styles.btn}
                                                    href={`/dobavljac/izmena/${dobavljac.sifraDobavljaca}`}
                                                >
                                                    Izmeni
                                                </Link>
                                                <div
                                                    className={styles.btn}
                                                    onClick={() => {
                                                        setDeletionDobavljac(
                                                            dobavljac
                                                        );
                                                    }}
                                                >
                                                    Izbriši
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
