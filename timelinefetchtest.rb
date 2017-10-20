url = 'http://matchhistory.na.leagueoflegends.com/en/#match-details/TRLH3/1002290025?gameHash=ccc16d4b994672b2&tab=overview'
url = 'https://acs.leagueoflegends.com/v1/stats/game/TRLH3/1002290025/timeline?gameHash=ccc16d4b994672b2'
require 'net/http'
require 'uri'
puts Net::HTTP.get URI(url)
