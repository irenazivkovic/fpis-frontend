import Link from "next/link";

import styles from "./page.module.scss";

export default function Landing() {
    return (
        <main className={styles.landing}>
            <div className={styles.container}>
                <Link className={styles.btn} href="/dobavljac/unos">
                    Unesi novog dobavljača
                </Link>
                <Link className={styles.btn} href="/dobavljac/pretraga">
                    Pretraži dobavljače
                </Link>
            </div>
            <div className={styles.container}>
                <Link className={styles.btn} href="/narudzbenica/unos">
                    Unesi novu narudžbenicu
                </Link>
                <Link className={styles.btn} href="/narudzbenica/pretraga">
                    Pretraži narudžbenice
                </Link>
            </div>
        </main>
    );
}
