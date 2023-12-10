"use client";

import Link from "next/link";
import styles from "./page.module.scss";
import {
    ArtikalDto,
    DobavljacDto,
    KatalogDto,
    KatalogOriginalDto,
    NarudbenicaFullDto,
    StavkaNarudzbeniceFullDto,
    ZaposlenDto,
} from "@/app/dto";
import { useEffect, useState } from "react";
import { formatDate, getAllData, getData, postData } from "@/app/helpers";
import { toast } from "sonner";
import { useRouter } from "next/router";

export default function narudzbenicaIzmena({
    params,
}: {
    params: { id: number };
}) {
    const router = useRouter();

    const [dobavljaci, setDobavljaci] = useState<DobavljacDto[]>([]);
    const [katalozi, setKatalozi] = useState<KatalogDto[]>([]);
    const [zaposleni, setZaposleni] = useState<ZaposlenDto[]>([]);

    const [narudzbenica, setNarudzbenica] = useState<NarudbenicaFullDto>({
        narudzbenicaID: 0,
        sektor: "",
        stanje: "",
        katalog: { idKataloga: 0, datum: new Date() },
        datum: new Date(),
        dobavljac: {
            naziv: "",
            sifraDobavljaca: 0,
            idAdresa: 0,
        },
        zaposleni: {
            idZaposlenog: 0,
            imeZaposlenog: "",
            prezimeZaposlenog: "",
        },
        stavke: [],
    });

    const [artikli, setArtikli] = useState<ArtikalDto[]>([]);
    const [artikalID, setArtikalID] = useState<number>(0);

    const [selectedStavka, setSelectedStavka] =
        useState<StavkaNarudzbeniceFullDto>();

    useEffect(() => {
        getData(
            `http://localhost:4000/narudzbenica/id/${params.id}`,
            "object"
        ).then((result: NarudbenicaFullDto) => {
            setNarudzbenica(result);
        });

        getAllData("http://localhost:4000/dobavljac", "array").then(
            (result: DobavljacDto[]) => {
                setDobavljaci(result);
                setNarudzbenica({ ...narudzbenica, dobavljac: result[0] });
            }
        );

        getAllData("http://localhost:4000/katalog", "array").then((result) => {
            const formatedResult: KatalogDto[] = result.map(
                (katalog: KatalogOriginalDto): KatalogDto => {
                    return {
                        idKataloga: katalog.idKataloga,
                        datum: new Date(katalog.datum),
                    };
                }
            );

            setKatalozi(formatedResult);
            setNarudzbenica({ ...narudzbenica, katalog: result[0] });
        });

        getAllData("http://localhost:4000/zaposlen", "array").then(
            (result: ZaposlenDto[]) => {
                setZaposleni(result);
                setNarudzbenica({ ...narudzbenica, zaposleni: result[0] });
            }
        );
    }, []);

    useEffect(() => {
        if (artikalID === 0) return;

        getData(
            `http://localhost:4000/artikal/${narudzbenica.katalog.idKataloga}`,
            "array"
        ).then((result) => {
            setArtikli(result);
            setArtikalID(result[0]);
        });

        setStavke([]);
    }, [selectedKatalogID]);

    const addStavku = () => {
        if (kolicina.length === 0) {
            toast.error("Unesite količinu artikla!");
            return;
        }

        if (napomena.length === 0) {
            toast.error("Unesite napomenu za stavku!");
            return;
        }

        const stavka: StavkaNarudzbeniceFullDto = {
            artikal: selectedArtikal!,
            kolicina: +kolicina,
            napomena: napomena,
            idNarudzbenice: +narudzbenicaID,
            rbNarudzbenice: stavke.length + 1,
        };

        setStavke([...stavke, stavka]);
        setKolicina("");
        setNapomena("");

        toast.info("Stavka je uspešno dodata.");
    };

    const removeStavku = (redniBroj: number) => {
        const filtered = stavke
            .filter((stavka) => stavka.rbNarudzbenice != redniBroj)
            .map(
                (
                    stavka: StavkaNarudzbeniceFullDto,
                    index: number
                ): StavkaNarudzbeniceFullDto => {
                    return {
                        ...stavka,
                        rbNarudzbenice: index + 1,
                    };
                }
            );

        setStavke(filtered);
    };

    const saveNarudzbenica = async () => {
        if (narudzbenicaID.length === 0) {
            toast.error("Molim Vas unesite ID narudžbenice!");
            return;
        }

        if (sektor.length === 0) {
            toast.error("Molima Vas unesite vrednost za sektor!");
            return;
        }

        if (stavke.length === 0) {
            toast.error("Molim Vas unesite bar jednu stavku!");
            return;
        }

        const narudzbenica: NarudbenicaFullDto = {
            narudzbenicaID: +narudzbenicaID,
            datum: new Date(datum),
            zaposleni: zaposleni.find(
                (zaposleni) => zaposleni.idZaposlenog === selectedZaposleniID
            )!,
            dobavljac: dobavljaci.find(
                (dobavljac) => dobavljac.sifraDobavljaca === selectedDobavljacID
            )!,
            katalog: katalozi.find(
                (katalog) => katalog.idKataloga === selectedKatalogID
            )!,
            sektor: sektor,
            stanje: "kreirana",
            stavke: stavke,
        };

        const response = await postData(
            "http://localhost:4000/narudzbenica",
            narudzbenica
        );

        if (response.status === 200) {
            toast.success("Narudžbenica je sačuvan!");
            clearInputs();
        } else {
            toast.error("Narudžbenica sa datim ID-jem već postoji!");
            setNarudzbenicaID("");
        }
    };

    const clearInputs = () => {
        setNarudzbenicaID("");
        setSektor("");
        setStavke([]);
    };

    return (
        <main className={styles.unos}>
            <div
                className={styles.editFormContainer}
                style={{
                    visibility:
                        selectedStavka === undefined ? "hidden" : "visible",
                }}
            >
                <div className={styles.editForm}>
                    <div className={styles.editFormHeader}>
                        <span />
                        <p
                            id={styles.dialogExit}
                            onClick={() => {
                                setSelectedStavka(undefined);
                            }}
                        >
                            X
                        </p>
                    </div>
                    <div className={styles.stavkaFields}>
                        <div className={styles.inputContainerStavka}>
                            <p>Artikal:</p>
                            <select
                                value={selectedStavka?.artikal.sifraArtikla}
                                className={styles.selectStyleStavka}
                                onChange={(e) => {
                                    const sifraArtikla = +e.target.value;
                                    const artikal: ArtikalDto = artikli.find(
                                        (artikal) =>
                                            artikal.sifraArtikla ===
                                            sifraArtikla
                                    )!;

                                    setSelectedStavka({
                                        ...selectedStavka!,
                                        artikal: artikal,
                                    });
                                }}
                            >
                                {artikli.map((artikal: ArtikalDto) => (
                                    <option value={artikal.sifraArtikla}>
                                        {`${artikal.nazivArtikla} {${artikal.jedinicaMere}}`}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className={styles.inputContainerStavka}>
                            <p>Količina:</p>
                            <input
                                type="text"
                                value={selectedStavka?.kolicina}
                                onChange={(e) => {
                                    if (
                                        (!isNaN(+e.target.value) &&
                                            +e.target.value > 0) ||
                                        e.target.value === ""
                                    ) {
                                        setSelectedStavka({
                                            ...selectedStavka!,
                                            kolicina: +e.target.value,
                                        });
                                    }
                                }}
                            />
                        </div>
                        <div className={styles.inputContainer}>
                            <p>Napomena:</p>
                            <textarea
                                value={selectedStavka?.napomena}
                                onChange={(e) => {
                                    setSelectedStavka({
                                        ...selectedStavka!,
                                        napomena: e.target.value,
                                    });
                                }}
                            ></textarea>
                        </div>
                        <div
                            className={styles.btn}
                            style={{ margin: "24px auto 0px auto" }}
                            onClick={() => {
                                setStavke(
                                    stavke.map((stavka) => {
                                        return stavka.rbNarudzbenice ===
                                            selectedStavka?.rbNarudzbenice
                                            ? selectedStavka
                                            : stavka;
                                    })
                                );
                                setSelectedStavka(undefined);
                            }}
                        >
                            Izmeni
                        </div>
                    </div>
                </div>
            </div>
            <div className={styles.form}>
                <div className={styles.formHeader}>
                    <p>Unos narudžbenice</p>
                    <Link className={styles.link} href="/">
                        X
                    </Link>
                </div>
                <div className={styles.formBody}>
                    <div className={styles.leftInputs}>
                        <div className={styles.inputContainer}>
                            <p>Dobavljač:</p>
                            <select
                                className={styles.selectStyle}
                                onChange={(e) => {
                                    setSelectedDobavljacID(+e.target.value);
                                }}
                            >
                                {dobavljaci.map((dobavljac: DobavljacDto) => (
                                    <option value={dobavljac.sifraDobavljaca}>
                                        {dobavljac.naziv}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className={styles.inputContainer}>
                            <p>Katalog:</p>
                            <select
                                className={styles.selectStyle}
                                onChange={(e) => {
                                    setSelectedKatalogID(+e.target.value);
                                }}
                            >
                                {katalozi.map((katalog: KatalogDto) => (
                                    <option value={katalog.idKataloga}>
                                        {katalog.idKataloga}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className={styles.inputContainer}>
                            <p>Zaposleni:</p>
                            <select
                                className={styles.selectStyle}
                                onChange={(e) => {
                                    setSelectedZaposleniID(+e.target.value);
                                }}
                            >
                                {zaposleni.map((zaposlen: ZaposlenDto) => (
                                    <option value={zaposlen.idZaposlenog}>
                                        {`${zaposlen.imeZaposlenog} ${zaposlen.prezimeZaposlenog}`}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className={styles.rightInputs}>
                        <div className={styles.inputContainer}>
                            <p>ID narudžbenice:</p>
                            <input
                                type="text"
                                value={narudzbenicaID}
                                onChange={(e) => {
                                    if (
                                        (!isNaN(+e.target.value) &&
                                            +e.target.value > 0) ||
                                        e.target.value === ""
                                    ) {
                                        setNarudzbenicaID(e.target.value);
                                    }
                                }}
                            />
                        </div>
                        <div className={styles.inputContainer}>
                            <p>Sektor:</p>
                            <input
                                type="text"
                                value={sektor}
                                onChange={(e) => {
                                    setSektor(e.target.value);
                                }}
                            />
                        </div>
                        <div className={styles.inputContainer}>
                            <p>Datum:</p>
                            <input
                                type="date"
                                value={datum}
                                onChange={(e) => {
                                    setDatum(e.target.value);
                                }}
                            />
                        </div>
                    </div>
                </div>
                <div className={styles.stavkeContainer}>
                    <div className={styles.stavkeHeader}>
                        <p>Stavka narudžbenice:</p>
                    </div>
                    <div className={styles.stavkeInputs}>
                        <div className={styles.stavkeInputsLeft}>
                            <div className={styles.inputContainerStavka}>
                                <p>Artikal:</p>
                                <select
                                    className={styles.selectStyleStavka}
                                    onChange={(e) => {
                                        const sifraArtikla = +e.target.value;

                                        setSelectedArtikalID(sifraArtikla);
                                        setSelectedArtikal(
                                            artikli.find(
                                                (artikal) =>
                                                    artikal.sifraArtikla ===
                                                    sifraArtikla
                                            )
                                        );
                                    }}
                                >
                                    {artikli.map((artikal: ArtikalDto) => (
                                        <option value={artikal.sifraArtikla}>
                                            {`${artikal.nazivArtikla} {${artikal.jedinicaMere}}`}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className={styles.inputContainerStavka}>
                                <p>Količina:</p>
                                <input
                                    type="text"
                                    value={kolicina}
                                    onChange={(e) => {
                                        if (
                                            (!isNaN(+e.target.value) &&
                                                +e.target.value > 0) ||
                                            e.target.value === ""
                                        ) {
                                            setKolicina(e.target.value);
                                        }
                                    }}
                                />
                            </div>
                        </div>
                        <div className={styles.inputContainer}>
                            <p>Napomena:</p>
                            <textarea
                                value={napomena}
                                onChange={(e) => {
                                    setNapomena(e.target.value);
                                }}
                            ></textarea>
                        </div>
                    </div>
                    <div
                        className={styles.btnStavka}
                        onClick={() => {
                            addStavku();
                        }}
                    >
                        Dodaj stavku
                    </div>
                    <div className={styles.stavkeDisplay}>
                        <div className={styles.stavkeDisplayHeader}>
                            <table width="100%">
                                <thead>
                                    <tr>
                                        <td width="10%">Redni broj</td>
                                        <td width="20%">Artikal</td>
                                        <td width="20%">Količina</td>
                                        <td width="30%">Napomena</td>
                                        <td width="10%"></td>
                                        <td width="10%"></td>
                                    </tr>
                                </thead>
                            </table>
                        </div>
                        <div className={styles.stavkeDisplayBody}>
                            <table width="100%">
                                <tbody>
                                    {stavke.map((stavka) => (
                                        <tr>
                                            <td width="10%">
                                                {stavka.rbNarudzbenice}
                                            </td>
                                            <td width="20%">
                                                {stavka.artikal.nazivArtikla}
                                            </td>
                                            <td width="20%">
                                                {`${stavka.kolicina} ${selectedArtikal?.jedinicaMere}`}
                                            </td>
                                            <td width="30%">
                                                {stavka.napomena}
                                            </td>
                                            <td
                                                className={styles.btnStavka}
                                                width="10%"
                                                onClick={() => {
                                                    setSelectedStavka(stavka);
                                                }}
                                            >
                                                Izmeni
                                            </td>
                                            <td
                                                className={styles.btnStavka}
                                                width="10%"
                                                onClick={() => {
                                                    removeStavku(
                                                        stavka.rbNarudzbenice
                                                    );
                                                }}
                                            >
                                                Obriši
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                <div className={styles.btnContainer}>
                    <div
                        className={styles.btn}
                        onClick={() => {
                            saveNarudzbenica();
                        }}
                    >
                        Sačuvaj
                    </div>
                    <div
                        className={styles.btn}
                        onClick={() => {
                            clearInputs();
                        }}
                    >
                        Poništi
                    </div>
                </div>
            </div>
        </main>
    );
}
