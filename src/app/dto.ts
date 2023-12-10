interface MestoDto {
    idMesto: number;
    nazivMesta: string;
}

interface AdresaDto {
    idAdresa: number;
    idMesto: number;
    nazivAdrese: string;
}

interface DobavljacDto {
    idAdresa: number;
    naziv: string;
    sifraDobavljaca: number;
}
interface DobavljacFullDto {
    sifraDobavljaca: number;
    naziv: string;
    adresa: {
        idAdresa: number;
        nazivAdresa: string;
        mesto: {
            idMesto: number;
            nazivMesta: string;
        };
    };
}

interface KatalogOriginalDto {
    idKataloga: number;
    datum: string;
}

interface KatalogDto {
    idKataloga: number;
    datum: Date;
}

interface ZaposlenDto {
    idZaposlenog: number;
    imeZaposlenog: string;
    prezimeZaposlenog: string;
}

interface ArtikalDto {
    sifraArtikla: number;
    nazivArtikla: string;
    jedinicaMere: string;
}

interface StavkaNarudzbeniceFullDto {
    idNarudzbenice: number;
    rbNarudzbenice: number;
    kolicina: number;
    napomena: string;
    artikal: ArtikalDto;
}

interface StavkaNarudzbeniceDto {
    idNarudzbenice: number;
    rbNarudzbenice: number;
    kolicina: number;
    napomena: string;
    sifraArtikla: number;
}

interface ResponseDto {
    message: string;
    status: number;
}

interface NarudbenicaFullDto {
    narudzbenicaID: number;
    sektor: string;
    datum: Date;
    katalog: KatalogDto;
    dobavljac: DobavljacDto;
    zaposleni: ZaposlenDto;
    stanje: string;
    stavke: StavkaNarudzbeniceFullDto[];
}

interface QueryParametersDto {
    kreirana: boolean;
    poslata: boolean;
    potpisana: boolean;
    imeZaposlenog: string;
}

export {
    type MestoDto,
    type AdresaDto,
    type DobavljacDto,
    type ResponseDto,
    type DobavljacFullDto,
    type KatalogOriginalDto,
    type KatalogDto,
    type ArtikalDto,
    type ZaposlenDto,
    type StavkaNarudzbeniceFullDto,
    type StavkaNarudzbeniceDto,
    type NarudbenicaFullDto,
    type QueryParametersDto,
};
