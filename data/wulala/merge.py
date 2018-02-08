import pandas as pd

gapminder = pd.read_csv('gapminder-w3.csv')
wvs = pd.read_csv('result-v3.csv')

res = pd.merge(wvs,gapminder,how='left',on='Name')
res.to_csv('wave3.csv')
