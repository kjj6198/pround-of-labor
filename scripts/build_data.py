"""Normalize the retained official releases. Coordinates are one-based."""
from pathlib import Path
import json, re, csv, hashlib
import pandas as pd
from bs4 import BeautifulSoup
ROOT=Path(__file__).resolve().parents[1]
RAW=ROOT/'data/raw'

def number(value):
    if pd.isna(value) or str(value).strip() in ('','...','--','-'): return None
    text=re.sub(r'[ⓅⓇpr,\s]','',str(value))
    if not re.fullmatch(r'-?\d+(\.\d+)?',text): raise ValueError(f'Unrecognized numeric cell: {value!r}')
    return float(text) if '.' in text else int(text)

def sheet(name):return pd.read_excel(RAW/name,header=None).fillna('')
def cell(name,frame,row,col):
    return dict(value=number(frame.iat[row,col]),source=name,row=row+1,column=col+1,status='provisional' if re.search('[Ⓟp]',str(frame.iat[row,col])) else 'revised' if re.search('[Ⓡr]',str(frame.iat[row,col])) else 'published')
def periods(frame):
    year=None
    for i,row in frame.iterrows():
        label=re.sub(r'\s','',str(row[0]))
        match=re.match(r'^(\d{3})年',label)
        if match:year=int(match[1])+1911; yield i,str(year),'annual' if year<2026 else 'ytd'
        elif year and (month:=re.match(r'^(\d{1,2})月',label)):yield i,f'{year}-{int(month[1]):02d}','monthly'

def main():
    sources=json.loads((ROOT/'data/sources.json').read_text())
    for source in sources:
        assert hashlib.sha256((RAW/source['id']).read_bytes()).hexdigest()==source['sha256']
    out=dict(checkedAt='2026-09-08',sources=sources)
    wage_text=BeautifulSoup((RAW/'minimum-wage.html').read_text(),'html.parser').get_text(' ',strip=True)
    standards=list(re.finditer(r'自(\d+)年(\d+)月(\d+)日起實施，訂定每月最低工資為([\d,]+)元，每小時最低工資為([\d,]+)元',wage_text))
    standard=standards[-1]
    out['currentMinimum']=dict(effectiveFrom=f'{int(standard[1])+1911}-{int(standard[2]):02d}-{int(standard[3]):02d}',minimum=dict(value=int(standard[4].replace(',','')),source='minimum-wage.html'),hourlyMinimum=dict(value=int(standard[5].replace(',','')),source='minimum-wage.html'))
    assert out['currentMinimum']['minimum']['value']==29500
    assert out['currentMinimum']['hourlyMinimum']['value']==196
    name='wages.ods'; f=sheet(name); wages=[]
    for i,row in f.iterrows():
        if re.fullmatch(r'\d{3}年',str(row[0])):
            year=int(str(row[0])[:3])+1911
            for c in [1]:
                if c==1 and year==2026:continue # Do not label year-to-date as a full year.
                if number(f.iat[i+1,c]) is None:continue
                wages.append(dict(period=str(year) if c==1 else f'{year}-{c-1:02d}',frequency='annual' if c==1 else 'monthly',mean=cell(name,f,i+1,c),median=cell(name,f,i+2,c)))
    out['wages']=wages
    for name,key,columns in [('indicators.xls','indicators',{'cpi':18,'minimum':19,'hourlyMinimum':20,'totalSalary':21,'mean':23,'hours':29,'normalHours':31}),('unemployment.xls','unemployment',{'total':2,'youth':10,'male':14,'female':15}),('migrants.xls','migrants',{'total':3,'valid':4,'industry':5,'welfare':11,'invalid':17,'industryIndonesia':6,'industryPhilippines':7,'industryThailand':8,'industryVietnam':9,'industryOther':10,'welfareIndonesia':12,'welfarePhilippines':13,'welfareThailand':14,'welfareVietnam':15,'welfareOther':16})]:
        f=sheet(name);rows=[]
        for i,period,freq in periods(f):
            if freq!='annual' or int(period)<2012:continue
            item=dict(period=period,frequency=freq,**{key:cell(name,f,i,c) for key,c in columns.items()})
            if key=='migrants':
                assert item['total']['value']==item['valid']['value']+item['invalid']['value']
                assert item['valid']['value']==item['industry']['value']+item['welfare']['value']
                for group in ['industry','welfare']:assert sum(item[group+n]['value'] for n in ['Indonesia','Philippines','Thailand','Vietnam','Other'])==item[group]['value']
            rows.append(item)
        out[key]=rows
    f=sheet('hours.ods');industries=[]
    for i,period,freq in periods(f):
        if freq!='annual' or int(period)<2012:continue
        for c in [2,3,6,7,8,*range(10,22)]:
            industries.append(dict(period=period,frequency=freq,industry=f.iat[3,c],hours=cell('hours.ods',f,i,c)))
    out['industries']=industries
    text=BeautifulSoup((RAW/'population.html').read_text(),'html.parser').get_text(' ',strip=True)
    ages=[]
    for label in ['0至14歲','15至64歲','65歲以上']:
        match=re.search(label+r'人口數為([\d,]+)人',text)
        assert match,label
        ages.append(dict(label=label,value=int(match[1].replace(',',''))))
    out['population']=dict(period='2025',groups=ages,total=sum(a['value'] for a in ages),source='population.html')
    f=sheet('births.ods');births=[]
    for i,row in f.iterrows():
        if re.fullmatch(r'民國\d+年',str(row[0])) and 2012<=int(row[1])<=2025:
            births.append(dict(period=str(int(row[1])),frequency='annual',births=cell('births.ods',f,i,2),rate=cell('births.ods',f,i,6)))
    out['births']=births
    assert births[0]['births']['value']==229481
    assert births[-1]['births']['value']==107812
    assert births[-1]['rate']['value']==4.62
    # Extend the mean series with the same official all-employee definition.
    # The retained median table begins in 2020; earlier values remain unavailable.
    for row in out['indicators']:
        if int(row['period'])<2020:
            wages.append(dict(period=row['period'],frequency='annual',mean=row['mean'],median=dict(value=None,source='wages.ods',row=None,column=None,status='not-in-source')))
    wages.sort(key=lambda row: row['period'])
    assert wages[-1]['mean']['value']==47885
    assert wages[-1]['median']['value']==38407
    assert out['migrants'][-1]['total']['value']==866275
    assert out['unemployment'][-1]['total']['value']==3.35
    assert out['population']['total']==23299132
    assert all(row['frequency']=='annual' and 2012<=int(row['period'])<=2025 for key in ['wages','indicators','unemployment','migrants','industries','births'] for row in out[key])
    (ROOT/'data/clean.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n')
    public=ROOT/'public/data';public.mkdir(exist_ok=True)
    (public/'labor.json').write_text(json.dumps(out,ensure_ascii=False,separators=(',',':'))+'\n')
    stories=json.loads((ROOT/'data/stories.json').read_text())
    (public/'stories.json').write_text(json.dumps(stories,ensure_ascii=False,separators=(',',':'))+'\n')
    with (public/'labor.csv').open('w',newline='',encoding='utf-8-sig') as target:
        writer=csv.writer(target);writer.writerow(['dataset','period','frequency','measure','value','source','row','column','status'])
        count=0
        for dataset in ['wages','indicators','unemployment','migrants','industries','births']:
            for row in out[dataset]:
                for measure,record in row.items():
                    if not isinstance(record,dict):continue
                    writer.writerow([dataset,row['period'],row['frequency'],row.get('industry',measure),record['value'],record['source'],record['row'],record['column'],record['status']]);count+=1
        for key in ['minimum','hourlyMinimum']:
            record=out['currentMinimum'][key]
            writer.writerow(['minimumPolicy',out['currentMinimum']['effectiveFrom'],'effective-date',key,record['value'],record['source'],'','','published']);count+=1
    (ROOT/'data/validation.json').write_text(json.dumps(dict(checkedAt=out['checkedAt'],observations=count,checks=['source SHA-256','migrant total = valid + invalid','valid = industry + welfare','nationalities sum to sector totals','release spot checks','population total'],status='passed'),indent=2)+'\n')
    print(f'Built {count} observations with source coordinates.')
if __name__=='__main__':main()
