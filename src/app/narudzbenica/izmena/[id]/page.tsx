"use client";

import Link from "next/link";
import styles from "./page.module.scss";
import {
    ArtikalDto,
    DobavljacDto,
    InitialStavkeState,
    KatalogDto,
    KatalogOriginalDto,
    NarudbenicaFullDto,
    Stanja,
    StavkaNarudzbeniceFullDto,
    ZaposlenDto,
} from "@/app/dto";
import { useEffect, useState } from "react";
import { formatDate, getAllData, getData, putData } from "@/app/helpers";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function narudzbenicaIzmena({
    params,
}: {
    params: { id: number };
}) {
    const router = useRouter();

    const [dobavljaci, setDobavljaci] = useState<DobavljacDto[]>([]);
    const [katalozi, setKatalozi] = useState<KatalogDto[]>([]);
    const [zaposleni, setZaposleni] = useState<ZaposlenDto[]>([]);
    const [artikli, setArtikli] = useState<ArtikalDto[]>([]);

    const [dobavljac, setDobavljac] = useState<DobavljacDto>();
    const [katalog, setKatalog] = useState<KatalogDto>();
    const [zaposlen, setZaposlen] = useState<ZaposlenDto>();
    const [IDNarudzbenice, setIDNarudzbenice] = useState<number>();
    const [sektor, setSektor] = useState<string>("");
    const [datum, setDatum] = useState<Date>(new Date());
    const [stanje, setStanje] = useState<string>("");
    const [stanja, setStanja] = useState<Stanja>({
        kreirana: true,
        poslata: false,
        potpisana: false,
    });

    const [selectedArtikal, setSelectedArtikal] = useState<ArtikalDto>();
    const [kolicina, setKolicina] = useState("");
    const [napomena, setNapomena] = useState<string>("");
    const [stavke, setStavke] = useState<StavkaNarudzbeniceFullDto[]>([]);

    const [selectedStavka, setSelectedStavka] =
        useState<StavkaNarudzbeniceFullDto>();
    const [initialStavkeState, setInitialStavkeState] =
        useState<InitialStavkeState>();

    useEffect(() => {
        getData(
            `http://localhost:4000/narudzbenica/id/${params.id}`,
            "object"
        ).then((result: NarudbenicaFullDto[]) => {
            setDobavljac(result[0].dobavljac);
            setKatalog(result[0].katalog);
            setZaposlen(result[0].zaposleni);
            setIDNarudzbenice(result[0].narudzbenicaID);
            setSektor(result[0].sektor);
            setDatum(result[0].datum);
            setStanje(result[0].stanje);
            setStavke(result[0].stavke);
            setInitialStavkeState({
                katalogID: result[0].katalog.idKataloga,
                stavke: result[0].stavke,
            });
            setStanja({
                kreirana: true,
                poslata: result[0].stanje === "poslata",
                potpisana: result[0].stanje === "potpisana",
            });
        });

        getAllData("http://localhost:4000/dobavljac", "array").then(
            (result: DobavljacDto[]) => {
                setDobavljaci(result);
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
        });

        getAllData("http://localhost:4000/zaposlen", "array").then(
            (result: ZaposlenDto[]) => {
                setZaposleni(result);
            }
        );
    }, []);

    useEffect(() => {
        if (!katalog) return;

        getData(
            `http://localhost:4000/artikal/${katalog.idKataloga}`,
            "array"
        ).then((result) => {
            setArtikli(result);
            setSelectedArtikal(result[0]);
        });
    }, [katalog]);

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
            idNarudzbenice: IDNarudzbenice!,
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

    const updateNarudzbenica = async () => {
        if (sektor.length === 0) {
            toast.error("Molima Vas unesite vrednost za sektor!");
            return;
        }

        if (stavke.length === 0) {
            toast.error("Molim Vas unesite bar jednu stavku!");
            return;
        }

        let newStanje: string = "";

        if (stanja.kreirana) newStanje = "kreirana";
        if (stanja.potpisana) newStanje = "potpisana";
        if (stanja.poslata) newStanje = "poslata";

        const narudzbenica: NarudbenicaFullDto = {
            dobavljac: dobavljac!,
            katalog: katalog!,
            zaposleni: zaposlen!,
            narudzbenicaID: IDNarudzbenice!,
            sektor: sektor,
            datum: datum,
            stanje: newStanje,
            stavke: stavke,
        };

        console.log(narudzbenica);

        const response = await putData(
            "http://localhost:4000/narudzbenica",
            narudzbenica
        );

        if (response.status === 200) {
            toast.success("Narudžbenica je sačuvan!");
            router.push("/narudzbenica/pretraga");
        } else {
            toast.error("Došlo je do greške pri ažuriranju narudžbenice!");
        }
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
                    <Link className={styles.link} href="/narudzbenica/pretraga">
                        X
                    </Link>
                </div>
                <div className={styles.formBody}>
                    <div className={styles.regularInputs}>
                        <div className={styles.leftInputs}>
                            <div className={styles.inputContainer}>
                                <p>Dobavljač:</p>
                                <select
                                    className={styles.selectStyle}
                                    onChange={(e) => {
                                        setDobavljac(
                                            dobavljaci.find(
                                                (dobavljac) =>
                                                    (dobavljac.sifraDobavljaca =
                                                        +e.target.value)
                                            )!
                                        );
                                    }}
                                >
                                    {dobavljaci.map(
                                        (dobavljac: DobavljacDto) => (
                                            <option
                                                value={
                                                    dobavljac.sifraDobavljaca
                                                }
                                            >
                                                {dobavljac.naziv}
                                            </option>
                                        )
                                    )}
                                </select>
                            </div>
                            <div className={styles.inputContainer}>
                                <p>Katalog:</p>
                                <select
                                    className={styles.selectStyle}
                                    onChange={(e) => {
                                        setKatalog(
                                            katalozi.find(
                                                (katalog) =>
                                                    katalog.idKataloga ===
                                                    +e.target.value
                                            )!
                                        );

                                        if (
                                            +e.target.value ===
                                            initialStavkeState!.katalogID
                                        ) {
                                            setStavke(
                                                initialStavkeState!.stavke
                                            );
                                        } else {
                                            setStavke([]);
                                        }
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
                                        setZaposlen(
                                            zaposleni.find(
                                                (zaposlen) =>
                                                    (zaposlen.idZaposlenog =
                                                        +e.target.value)
                                            )!
                                        );
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
                                    value={IDNarudzbenice}
                                    disabled={true}
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
                                    value={formatDate(datum)}
                                    onChange={(e) => {
                                        setDatum(new Date(e.target.value));
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                    <div className={styles.statuses}>
                        <div className={styles.status}>
                            <p>Kreirana</p>
                            <input
                                type="checkbox"
                                checked={stanja.kreirana}
                                disabled={true}
                            />
                        </div>
                        <div className={styles.status}>
                            <p>Potpisana</p>
                            <input
                                type="checkbox"
                                checked={stanja.potpisana || stanja.poslata}
                                disabled={["potpisana", "poslata"].includes(
                                    stanje
                                )}
                                onClick={() => {
                                    setStanja({
                                        ...stanja,
                                        potpisana: !stanja.potpisana,
                                    });
                                }}
                            />
                        </div>
                        <div className={styles.status}>
                            <p>Poslata</p>
                            <input
                                type="checkbox"
                                checked={stanja.poslata}
                                disabled={["kreirana", "poslata"].includes(
                                    stanje
                                )}
                                onClick={() => {
                                    setStanja({
                                        ...stanja,
                                        poslata: !stanja.poslata,
                                    });
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
                            updateNarudzbenica();
                        }}
                    >
                        Sačuvaj
                    </div>
                </div>
            </div>
        </main>
    );
}
