import pandas as pd

version='6'
gapminder = pd.read_csv('gapminder-w{}.csv'.format(version))
wvs = pd.read_csv('result-v{}.csv'.format(version))

res = pd.merge(gapminder,wvs,how='left',on='Name')
res.to_csv('wave{}.csv'.format(version))
