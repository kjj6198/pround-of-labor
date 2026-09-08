"""Fetch official releases, retain bytes and record hashes. Never fetch at app runtime."""
from pathlib import Path
from urllib.parse import urljoin
import hashlib, json, subprocess, sys, tempfile
from bs4 import BeautifulSoup
from datetime import datetime, timezone

ROOT = Path(__file__).resolve().parents[1]
RAW = ROOT / 'data/raw'
RAW.mkdir(exist_ok=True, parents=True)
SOURCES = []

def fetch(key, url, title, page=None):
    content = subprocess.check_output(["curl", *(["-k"] if url.startswith("https://ws.dgbas.gov.tw/") and "--allow-incomplete-dgbas-chain" in sys.argv else []), "-fLsS", "--retry", "2", "--max-time", "90", url])
    path = RAW / key
    path.write_bytes(content)
    SOURCES.append(dict(id=key, title=title, url=url, page=page or url, sha256=hashlib.sha256(content).hexdigest(), tlsVerification='skipped-incomplete-chain' if url.startswith('https://ws.dgbas.gov.tw/') and '--allow-incomplete-dgbas-chain' in sys.argv else 'verified', fetchedAt=datetime.now(timezone.utc).isoformat()))
    print(key, len(content), flush=True)
    return content

def download():
    page = 'https://www.dgbas.gov.tw/News.aspx?_CSN=135&n=4437&sms=10980'
    html = fetch('earnings-release.html',page,'主計總處薪資與生產力統計')
    soup = BeautifulSoup(html,'html.parser')
    # The newest publication is the first matching table link, never an older release.
    for table, key in [('表1','earnings'),('表5','wages'),('表10','hours')]:
        link = next(a for a in soup.select('a[href]') if a.get_text(strip=True)==table and '.ods' in a['href'])
        fetch(key+'.ods',urljoin(page,link['href']),f'主計總處 {table}',page)
    for table,key,title in [('212030','migrants','引進移工在臺人數－按國籍分'),('21010','indicators','主要勞動經濟指標'),('22050','unemployment','失業率－按教育程度、年齡及性別分')]:
        page = f'https://statdb.mol.gov.tw/html/mon/{table}.htm'
        html=fetch(key+'.html',page,title)
        soup=BeautifulSoup(html,'html.parser')
        link=next(a for a in soup.select('a[href]') if '.xls' in a['href'].lower())
        fetch(key+'.xls',urljoin(page,link['href']),title,page)
    fetch('minimum-wage.html','https://www.mol.gov.tw/1607/28162/28166/28180/70460/76761/76833/post','歷年最低工資／基本工資調整')
    fetch('employment.html','https://www.dgbas.gov.tw/News_Content.aspx?n=3602&s=236629','主計總處 115 年 7 月就業失業統計')
    fetch('births.ods','https://www.ris.gov.tw/info-popudata/app/awFastDownload/view?type=ods&m4c=y2s1&d5c=','戶政司 出生數按性別及粗出生率（按登記日期）','https://www.ris.gov.tw/info-popudata/app/awFastDownload/toMain_panel')
    fetch('population.html','https://www.moi.gov.tw/News_Content.aspx?n=9&s=335870&sms=9009','內政部 114 年 12 月戶口統計資料分析')


def main():
    global RAW
    destination=ROOT/'data/raw'
    with tempfile.TemporaryDirectory(prefix='labor-fetch-') as staging:
        RAW=Path(staging)
        download()
        for path in RAW.iterdir():
            (destination/path.name).write_bytes(path.read_bytes())
        (ROOT/'data/sources.json').write_text(json.dumps(SOURCES,ensure_ascii=False,indent=2)+'\n')

if __name__=='__main__': main()
