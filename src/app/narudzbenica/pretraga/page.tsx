"use client";
import Link from "next/link";
import styles from "./page.module.scss";
import { useEffect, useState } from "react";
import { NarudbenicaFullDto, QueryParametersDto } from "@/app/dto";
import { deleteData, formatDate, getData } from "@/app/helpers";
import { toast } from "sonner";

export default function NarudzbenicaPretraga() {
    const [params, setParams] = useState<QueryParametersDto>({
        imeZaposlenog: "",
        kreirana: false,
        poslata: false,
        potpisana: false,
    });
    const [narudzbenice, setNarudzbenice] = useState<NarudbenicaFullDto[]>([]);

    const [deletionNarudzbenica, setDeletionNarudzbenica] =
        useState<NarudbenicaFullDto>();

    const deleteNarudzbenica = async () => {
        const response = await deleteData(
            `http://localhost:4000/narudzbenica/${
                deletionNarudzbenica!.narudzbenicaID
            }`,
            { id: deletionNarudzbenica!.narudzbenicaID }
        );

        if (response.status === 200) {
            toast.success("Narudžbenica je obrisana");
            setNarudzbenice([]);
            await new Promise((resolve) => setTimeout(resolve, 100));
            findNarudzbenice();
            setDeletionNarudzbenica(undefined);
        } else {
            toast.error("Došlo je do greške pri brisanju narudžbenice!");
            setDeletionNarudzbenica(undefined);
        }
    };

    const findNarudzbenice = () => {
        getData(
            `http://localhost:4000/narudzbenica/${
                params.imeZaposlenog.length === 0 ? " " : params.imeZaposlenog
            }/${params.kreirana}/${params.poslata}/${params.potpisana}`,
            "array"
        ).then((result) => {
            setNarudzbenice(result);
        });
    };

    return (
        <main className={styles.pretraga}>
            <div
                className={styles.questionForm}
                style={{
                    visibility:
                        deletionNarudzbenica === undefined
                            ? "hidden"
                            : "visible",
                }}
            >
                <div className={styles.dialog}>
                    <div className={styles.dialogHeader}>
                        <span />
                        <p
                            id={styles.dialogExit}
                            onClick={() => {
                                setDeletionNarudzbenica(undefined);
                            }}
                        >
                            X
                        </p>
                    </div>
                    <p>
                        Da li ste sigurni da želite da izbrišete ovu
                        narudžbenicu?
                    </p>
                    <div
                        className={styles.btnDelete}
                        onClick={() => {
                            deleteNarudzbenica();
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
                                value={params?.imeZaposlenog}
                                onChange={(e) => {
                                    setParams({
                                        ...params!,
                                        imeZaposlenog: e.target.value,
                                    });
                                }}
                            />
                        </div>
                        <div className={styles.statuses}>
                            <div className={styles.status}>
                                <p>Kreirana</p>
                                <input
                                    type="checkbox"
                                    onClick={() => {
                                        setParams({
                                            ...params!,
                                            kreirana: !params?.kreirana,
                                        });
                                    }}
                                />
                            </div>
                            <div className={styles.status}>
                                <p>Potpisana</p>
                                <input
                                    type="checkbox"
                                    onClick={() => {
                                        setParams({
                                            ...params!,
                                            potpisana: !params?.potpisana,
                                        });
                                    }}
                                />
                            </div>
                            <div className={styles.status}>
                                <p>Poslata</p>
                                <input
                                    type="checkbox"
                                    onClick={() => {
                                        setParams({
                                            ...params!,
                                            poslata: !params?.poslata,
                                        });
                                    }}
                                />
                            </div>
                        </div>
                        <div
                            className={styles.findBtn}
                            onClick={() => {
                                findNarudzbenice();
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
                                        <td width="150px">ID Narudžbenice</td>
                                        <td width="150px">Sektor</td>
                                        <td width="200px">Datum</td>
                                        <td width="200px">Dobavljač</td>
                                        <td width="100px">Katalog</td>
                                        <td width="200px">Zaposleni</td>
                                        <td width="180px"></td>
                                    </tr>
                                </thead>
                            </table>
                        </div>
                        <div className={styles.resultsBody}>
                            <table>
                                <tbody>
                                    {narudzbenice.map((narudzbenica) => (
                                        <tr>
                                            <td width="150px">
                                                {narudzbenica.narudzbenicaID}
                                            </td>
                                            <td width="150px">
                                                {narudzbenica.sektor}
                                            </td>
                                            <td width="200px">
                                                {formatDate(narudzbenica.datum)}
                                            </td>
                                            <td width="200px">
                                                {narudzbenica.dobavljac.naziv}
                                            </td>
                                            <td width="100px">
                                                {
                                                    narudzbenica.katalog
                                                        .idKataloga
                                                }
                                            </td>
                                            <td width="200px">
                                                {`${narudzbenica.zaposleni.imeZaposlenog} ${narudzbenica.zaposleni.prezimeZaposlenog}`}
                                            </td>
                                            <td width="180px">
                                                <Link
                                                    className={styles.btn}
                                                    href={`/narudzbenica/izmena/${narudzbenica.narudzbenicaID}`}
                                                >
                                                    Izmeni
                                                </Link>
                                                <div
                                                    className={styles.btn}
                                                    onClick={() => {
                                                        setDeletionNarudzbenica(
                                                            narudzbenica
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
